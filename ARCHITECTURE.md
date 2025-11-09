# Cadence - Application Architecture & Implementation Plan

## Executive Summary

**Cadence** is a specialized rich-text editor for songwriters that provides real-time rhythmic analysis and visual feedback on lyric structure. This document outlines the complete technical architecture, technology choices, and implementation strategy.

---

## 1. Technology Stack

### 1.1 Core Technologies

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **React** | ^18.3.1 | UI Framework | Modern, well-documented, excellent hooks API for state management |
| **TypeScript** | ^5.6.3 | Type Safety | Prevents bugs, improves DX, industry standard in 2024-2025 |
| **Vite** | ^6.0.3 | Build Tool | Lightning-fast HMR, ESM-first, excellent TypeScript support |
| **CodeMirror 6** | ^6.35.0 | Editor Core | Native gutter support, powerful decoration system, excellent performance |
| **hyphen** | ^1.10.6 | Syllable Detection | Industry-standard hyphenation using Liang's algorithm |

### 1.2 Supporting Libraries

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@uiw/react-codemirror": "^4.23.5",
    "@codemirror/view": "^6.35.0",
    "@codemirror/state": "^6.4.1",
    "@codemirror/language": "^6.10.3",
    "hyphen": "^1.10.6"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "vite": "^6.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    "@types/hyphen": "^1.3.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "tailwindcss": "^3.4.17",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49"
  }
}
```

### 1.3 Why CodeMirror 6?

**Chosen over alternatives (ProseMirror, Monaco Editor, Slate) because:**

1. **Native Gutter Support**: Built-in, well-documented API for custom gutters with markers
2. **Powerful Decoration System**: Efficient for inline syllable markers without DOM manipulation
3. **Line-Based Model**: Perfect for per-line syllable counting in lyrics
4. **Performance**: Designed for large documents with efficient virtual scrolling
5. **Extensibility**: Clean plugin architecture for custom extensions
6. **Modern Architecture**: Functional, immutable state management aligns with React

**Why NOT ProseMirror?**
- Designed for structured documents (like Notion), adds unnecessary complexity
- No native gutter support - would require custom implementation
- Document schema model is overkill for simple line-based lyrics

**Why NOT Monaco Editor?**
- Heavyweight (VS Code's editor), includes features we don't need
- Primarily for code editing, not prose
- Less flexible for custom UI requirements

---

## 2. Application Architecture

### 2.1 Component Hierarchy

```
App (Root)
│
├── LyricEditor (Main Container)
│   │
│   ├── CodeMirrorEditor (Editor Wrapper Component)
│   │   │
│   │   ├── Extensions:
│   │   │   ├── SyllableGutterExtension
│   │   │   ├── SyllableDecorationsExtension
│   │   │   ├── SmartFormattingExtension
│   │   │   ├── ActiveLineHighlightExtension
│   │   │   └── PasteHandlerExtension
│   │   │
│   │   └── Event Handlers
│   │
│   └── ErrorDisplay (Processing Warnings)
│
├── SyllableProcessor (Web Worker)
│   └── Hyphen Library Integration
│
└── Utilities & Types
    ├── debounce.ts
    ├── syllableCounter.ts
    └── types.ts
```

### 2.2 Data Flow

```
┌─────────────┐
│ User Types  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Editor Updates   │◄── CodeMirror State Management
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Debounce (300ms) │◄── Prevents excessive processing
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│ Extract Line Content │
└──────┬───────────────┘
       │
       ▼
┌─────────────────────────┐
│ Post to Web Worker      │◄── Non-blocking processing
│ (SyllableProcessor)     │
└──────┬──────────────────┘
       │
       ▼
┌──────────────────────────┐
│ hyphen/en processes text │◄── Returns hyphenated string
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Count soft hyphens       │◄── syllables = hyphens + 1
│ Return syllable data     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Main thread receives     │
│ syllable counts + errors │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Update Editor Extensions:│
│ • Gutter markers         │
│ • Inline decorations     │
│ • Error warnings         │
└──────────────────────────┘
```

---

## 3. Core Feature Implementation

### 3.1 Syllable Counting System

#### Algorithm
```typescript
// Uses Franklin M. Liang's hyphenation algorithm via hyphen package
import { hyphenate } from "hyphen/en";

async function countSyllables(text: string): Promise<number> {
  // Returns string with soft hyphens (\u00AD) at syllable breaks
  const hyphenated = await hyphenate(text);
  
  // Count soft hyphens + 1 = syllable count
  const softHyphens = (hyphenated.match(/\u00AD/g) || []).length;
  return softHyphens + 1;
}

// Example:
// "beautiful" → "beau\u00ADti\u00ADful" → 3 syllables
```

#### Web Worker Implementation
```typescript
// workers/syllableProcessor.worker.ts
import { hyphenate } from "hyphen/en";

interface ProcessRequest {
  lines: Array<{ lineNumber: number; text: string }>;
}

interface ProcessResponse {
  results: Array<{ lineNumber: number; syllables: number; hyphenated: string }>;
  errors: Array<{ lineNumber: number; word: string }>;
}

self.onmessage = async (e: MessageEvent<ProcessRequest>) => {
  const { lines } = e.data;
  const results = [];
  const errors = [];

  for (const { lineNumber, text } of lines) {
    try {
      const hyphenated = await hyphenate(text);
      const syllables = (hyphenated.match(/\u00AD/g) || []).length + 1;
      results.push({ lineNumber, syllables, hyphenated });
    } catch (error) {
      errors.push({ lineNumber, word: text });
    }
  }

  self.postMessage({ results, errors });
};
```

### 3.2 Gutter Display

#### Implementation with CodeMirror
```typescript
// extensions/syllableGutter.ts
import { gutter, GutterMarker } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";

// State effect for updating syllable counts
const setSyllableCounts = StateEffect.define<Map<number, number>>();

// State field to store syllable counts
const syllableCountsField = StateField.define<Map<number, number>>({
  create: () => new Map(),
  update: (counts, tr) => {
    for (let effect of tr.effects) {
      if (effect.is(setSyllableCounts)) {
        return effect.value;
      }
    }
    return counts;
  }
});

// Custom gutter marker
class SyllableMarker extends GutterMarker {
  constructor(private count: number, private isActive: boolean) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.textContent = String(this.count);
    span.className = this.isActive 
      ? "syllable-count syllable-count-active" 
      : "syllable-count";
    return span;
  }

  eq(other: SyllableMarker) {
    return this.count === other.count && this.isActive === other.isActive;
  }
}

// Gutter extension
export const syllableGutter = [
  syllableCountsField,
  gutter({
    class: "cm-syllable-gutter",
    lineMarker: (view, line) => {
      const counts = view.state.field(syllableCountsField);
      const lineNumber = view.state.doc.lineAt(line.from).number;
      const count = counts.get(lineNumber);
      
      if (count === undefined) return null;
      
      // Check if this is the active line
      const isActive = view.state.selection.main.head >= line.from 
        && view.state.selection.main.head <= line.to;
      
      return new SyllableMarker(count, isActive);
    },
    initialSpacer: () => new SyllableMarker(99, false) // Reserve space for 2 digits
  })
];
```

### 3.3 Inline Syllable Visualization

```typescript
// extensions/syllableDecorations.ts
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";

const syllableSeparatorMark = Decoration.mark({
  class: "cm-syllable-separator",
  // CSS will add: content: "·" or "‧" 
});

const setSyllableDecorations = StateEffect.define<DecorationSet>();

const syllableDecorationsField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update: (decorations, tr) => {
    decorations = decorations.map(tr.changes);
    for (let effect of tr.effects) {
      if (effect.is(setSyllableDecorations)) {
        return effect.value;
      }
    }
    return decorations;
  },
  provide: f => EditorView.decorations.from(f)
});

// Function to create decorations from hyphenated text
function createSyllableDecorations(
  view: EditorView,
  hyphenatedLines: Map<number, string>
): DecorationSet {
  const decorations = [];
  
  for (const [lineNumber, hyphenatedText] of hyphenatedLines) {
    const line = view.state.doc.line(lineNumber);
    let pos = 0;
    
    for (let i = 0; i < hyphenatedText.length; i++) {
      if (hyphenatedText[i] === '\u00AD') {
        // Add decoration just after this position
        decorations.push(syllableSeparatorMark.range(line.from + pos));
      } else {
        pos++;
      }
    }
  }
  
  return Decoration.set(decorations, true);
}

export const syllableDecorations = [syllableDecorationsField];
```

### 3.4 Smart Formatting

```typescript
// extensions/smartFormatting.ts
import { Decoration, ViewUpdate, MatchDecorator } from "@codemirror/view";
import { ViewPlugin, DecorationSet } from "@codemirror/view";

// Section headers: [Verse 1], [Chorus], etc.
const sectionHeaderDecorator = new MatchDecorator({
  regexp: /^\[.*\]$/gm,
  decoration: Decoration.line({ class: "cm-section-header" })
});

// Chords: [G], [Am], [F#m7], etc.
const chordDecorator = new MatchDecorator({
  regexp: /\[[A-G][#b]?m?[0-9]?[^[\]]*\]/g,
  decoration: Decoration.mark({ class: "cm-chord" })
});

// Comments: # or //
const commentDecorator = new MatchDecorator({
  regexp: /^(#|\/\/).*$/gm,
  decoration: Decoration.line({ class: "cm-comment-line" })
});

export const smartFormatting = ViewPlugin.fromClass(class {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  buildDecorations(view: EditorView): DecorationSet {
    const builder = [];
    
    builder.push(...sectionHeaderDecorator.createDeco(view));
    builder.push(...chordDecorator.createDeco(view));
    builder.push(...commentDecorator.createDeco(view));
    
    return Decoration.set(builder, true);
  }
}, {
  decorations: v => v.decorations
});
```

### 3.5 Intelligent Paste Handling

```typescript
// extensions/pasteHandler.ts
import { EditorView } from "@codemirror/view";

export const pasteHandler = EditorView.domEventHandlers({
  paste(event, view) {
    const text = event.clipboardData?.getData("text/plain");
    
    if (!text) return false;
    
    // Check if text contains multiple lines
    const lines = text.split(/\r?\n/);
    
    if (lines.length > 1) {
      event.preventDefault();
      
      // Insert each line as a separate paragraph
      const { from } = view.state.selection.main;
      const formattedText = lines.join('\n');
      
      view.dispatch({
        changes: { from, insert: formattedText },
        selection: { anchor: from + formattedText.length }
      });
      
      return true;
    }
    
    return false; // Let default handler process single-line paste
  }
});
```

---

## 4. Project Structure

```
cadence-2/
├── public/
│   └── (static assets)
│
├── src/
│   ├── components/
│   │   ├── LyricEditor.tsx          # Main editor container
│   │   ├── CodeMirrorEditor.tsx     # CodeMirror wrapper
│   │   └── ErrorDisplay.tsx         # Shows processing warnings
│   │
│   ├── extensions/
│   │   ├── syllableGutter.ts        # Gutter with syllable counts
│   │   ├── syllableDecorations.ts   # Inline syllable markers
│   │   ├── smartFormatting.ts       # Auto-format sections/chords/comments
│   │   ├── activeLineHighlight.ts   # Highlight current line
│   │   └── pasteHandler.ts          # Multi-line paste handling
│   │
│   ├── workers/
│   │   └── syllableProcessor.worker.ts  # Web Worker for syllable processing
│   │
│   ├── utils/
│   │   ├── debounce.ts              # Debounce utility
│   │   ├── syllableCounter.ts       # Syllable counting logic
│   │   └── workerManager.ts         # Web Worker management
│   │
│   ├── types/
│   │   └── index.ts                 # TypeScript type definitions
│   │
│   ├── styles/
│   │   ├── editor.css               # Editor-specific styles
│   │   └── global.css               # Global styles
│   │
│   ├── App.tsx                      # Root component
│   ├── main.tsx                     # Entry point
│   └── vite-env.d.ts                # Vite type definitions
│
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
├── README.md
└── ARCHITECTURE.md (this file)
```

---

## 5. Implementation Phases

### Phase 1: Project Setup (Day 1)
- [ ] Initialize Vite + React + TypeScript project (npm create vite@latest . -- --template react-ts)
- [ ] Install dependencies (CodeMirror, hyphen, Tailwind)
- [ ] Configure Vite for Web Workers
- [ ] Set up Tailwind CSS
- [ ] Create basic project structure

### Phase 2: Core Editor (Day 1-2)
- [ ] Implement basic CodeMirror wrapper component
- [ ] Add basic styling and layout
- [ ] Test text input and state management

### Phase 3: Syllable Processing (Day 2-3)
- [ ] Implement Web Worker for syllable processing
- [ ] Integrate hyphen/en package
- [ ] Create syllable counting logic
- [ ] Add debouncing for text changes
- [ ] Test with various lyric samples

### Phase 4: Gutter Display (Day 3-4)
- [ ] Create syllable gutter extension
- [ ] Implement gutter marker rendering
- [ ] Add active line highlighting in gutter
- [ ] Style gutter appropriately

### Phase 5: Inline Syllable Markers (Day 4-5)
- [ ] Create syllable decoration extension
- [ ] Implement decoration placement logic
- [ ] Add subtle visual markers (dots/hyphens)
- [ ] Test with various word lengths

### Phase 6: Smart Formatting (Day 5-6)
- [ ] Implement section header detection
- [ ] Add chord annotation styling
- [ ] Create comment line formatting
- [ ] Style all formatting patterns

### Phase 7: Enhanced Features (Day 6-7)
- [ ] Implement intelligent paste handler
- [ ] Add error display component
- [ ] Create loading/processing indicators
- [ ] Add keyboard shortcuts

### Phase 8: Polish & Testing (Day 7-8)
- [ ] Refine all styling
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] User experience refinements
- [ ] Documentation

---

## 6. Styling Strategy

### 6.1 Color Palette

```css
:root {
  /* Primary Colors */
  --color-bg: #1e1e1e;              /* Dark background */
  --color-editor-bg: #252526;       /* Editor background */
  --color-gutter-bg: #1e1e1e;       /* Gutter background */
  --color-text: #d4d4d4;            /* Primary text */
  --color-text-dim: #858585;        /* Secondary text */
  
  /* Accent Colors */
  --color-accent: #007acc;          /* Links, active elements */
  --color-success: #4ec9b0;         /* Success states */
  --color-warning: #dcdcaa;         /* Warnings */
  --color-error: #f48771;           /* Errors */
  
  /* Feature Colors */
  --color-syllable-count: #569cd6;  /* Syllable count in gutter */
  --color-syllable-active: #4ec9b0; /* Active line syllable count */
  --color-section-header: #c586c0;  /* [Verse 1], [Chorus] */
  --color-chord: #dcdcaa;           /* [G], [Am] */
  --color-comment: #6a9955;         /* # or // comments */
  --color-syllable-marker: #505050; /* Inline syllable dots */
  
  /* UI Elements */
  --color-line-highlight: #2a2a2a;  /* Active line background */
  --color-border: #3e3e3e;          /* Borders */
}
```

### 6.2 Typography

```css
/* Editor Font */
.cm-editor {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
               Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.8;
  letter-spacing: 0.01em;
}

/* Gutter Font */
.cm-syllable-gutter {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  font-weight: 500;
}

/* Section Headers */
.cm-section-header {
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.02em;
}
```

---

## 7. Performance Considerations

### 7.1 Optimization Strategies

1. **Debouncing**: 300ms delay on text changes before processing
2. **Web Worker**: All syllable processing off main thread
3. **Viewport-Only Processing**: Only process visible lines initially
4. **Incremental Updates**: Only reprocess changed lines
5. **Memoization**: Cache syllable results for unchanged lines
6. **Virtual Scrolling**: CodeMirror handles this automatically

### 7.2 Performance Targets

- **Initial Load**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **Text Input Lag**: < 16ms (60fps)
- **Syllable Processing**: < 500ms for 100 lines
- **Memory Usage**: < 100MB for 1000 line document

---

## 8. Browser Support

### Target Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Required Features
- ES2020+ (async/await, optional chaining, etc.)
- Web Workers
- CSS Grid & Flexbox
- Custom Properties (CSS Variables)

---

## 9. Testing Strategy

### 9.1 Unit Tests
- Syllable counting accuracy
- Debounce utility
- Pattern matching for formatting

### 9.2 Integration Tests
- Editor state management
- Web Worker communication
- Extension interactions

### 9.3 E2E Tests
- Complete user workflows
- Paste handling
- Multi-line editing

### 9.4 Test Data
```
Sample lyrics for testing:
- Simple words (cat, dog, run)
- Complex words (beautiful, revolutionary)
- Numbers and symbols
- Empty lines
- Very long lines (> 100 characters)
- Special characters & Unicode
- Real song lyrics from public domain
```

---

## 10. Future Enhancements

### Phase 2 Features (Post-MVP)
- [ ] Export to various formats (PDF, TXT, HTML)
- [ ] Multiple language support (Spanish, German, etc.)
- [ ] Custom syllable pattern overrides
- [ ] Rhyme detection and highlighting
- [ ] Stress pattern analysis
- [ ] Collaborative editing
- [ ] Cloud sync (optional)
- [ ] Mobile-responsive version
- [ ] Dark/light theme toggle
- [ ] Custom color schemes

---

## 11. Security & Privacy

### Data Handling
- ✅ **All processing is local** - no data leaves the user's machine
- ✅ **No analytics or tracking**
- ✅ **No external API calls**
- ✅ **No user accounts required**
- ✅ **LocalStorage for preferences** (optional)

### Dependencies
- All dependencies are from trusted sources (npm)
- Regular security audits with `npm audit`
- Minimal dependency tree to reduce attack surface

---

## 12. Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with React + TypeScript rules
- **Formatting**: Prettier with 2-space indentation
- **Naming**: camelCase for variables/functions, PascalCase for components

### Git Workflow
- Main branch: `main` (production-ready)
- Feature branches: `feature/feature-name`
- Conventional commits: `feat:`, `fix:`, `docs:`, etc.

### Documentation
- Inline JSDoc comments for complex functions
- README with setup instructions
- CHANGELOG for version tracking

---

## 13. Success Metrics

### User Experience
- User can see syllable counts within 500ms of typing
- No perceptible lag during typing
- Visual feedback is clear and non-intrusive
- Smart formatting works accurately 95%+ of the time

### Technical
- < 100KB bundle size (gzipped)
- < 100ms for syllable processing of typical line
- < 50ms paint time after state update
- 0 console errors in production

---

## Conclusion

This architecture provides a solid foundation for building **Cadence** - a modern, performant, and user-friendly songwriting tool. The tech stack is proven, the architecture is scalable, and the implementation plan is methodical.

**Key Strengths:**
- ✅ 100% local, no external dependencies
- ✅ Modern, maintainable codebase
- ✅ Excellent performance characteristics
- ✅ Extensible architecture for future features
- ✅ Great developer experience

**Next Steps:**
1. Review and approve architecture
2. Begin Phase 1: Project Setup
3. Iterate based on testing and feedback
