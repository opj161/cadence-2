# Documentation Reference - Cadence Project

> All documentation downloaded and saved on November 9, 2025

This directory contains comprehensive reference documentation for all key technologies used in the Cadence application.

---

## 📚 Available Documentation

### 1. CodeMirror 6 API Reference
**File:** `codemirror-reference.md`

**Contents:**
- ✅ Editor Setup & Initialization
- ✅ Extensions & Configuration
- ✅ Gutters API (Custom gutters, GutterMarker class, line numbers)
- ✅ Decorations API (Mark, Widget, Replace, Line decorations)
- ✅ State Management (StateField, StateEffect, Facets)
- ✅ View Plugins (fromClass, define, lifecycle)
- ✅ Event Handling (DOM events, update listeners)
- ✅ Theming (Base theme, custom themes)
- ✅ Best Practices & Common Patterns

**Key Topics for Cadence:**
- Custom gutter implementation for syllable counts
- Decoration system for inline syllable markers
- State management for async processing
- Pattern matching for smart formatting

---

### 2. React CodeMirror Reference
**File:** `react-codemirror-reference.md`

**Contents:**
- ✅ Installation & Setup
- ✅ Component Props & TypeScript Types
- ✅ Hooks API (useCodeMirror)
- ✅ Extensions Integration
- ✅ Theme Configuration
- ✅ Lifecycle Hooks
- ✅ Basic Setup Options
- ✅ Controlled Component Patterns
- ✅ Ref Access to View/State

**Key Topics for Cadence:**
- React integration patterns
- Extension management in React
- State synchronization
- Component lifecycle with editor

---

### 3. Hyphen Package & Web Workers Reference
**File:** `hyphen-webworkers-reference.md`

**Contents:**
- ✅ Hyphen Package Usage (async/sync APIs)
- ✅ Syllable Counting Algorithm (soft hyphen counting)
- ✅ Multilingual Support
- ✅ Configuration Options
- ✅ Web Workers API (TypeScript patterns)
- ✅ Vite Web Worker Configuration
- ✅ Worker Manager Implementation
- ✅ Complete Cadence Worker Example

**Key Topics for Cadence:**
- Syllable counting from hyphenation
- Async processing in Web Workers
- TypeScript worker patterns
- Message passing & error handling

---

## 🎯 Quick Start Guide

### For Editor Implementation
1. Start with `codemirror-reference.md` → **Gutters API** section
2. Review `react-codemirror-reference.md` → **Basic Usage** section
3. Study the **Common Patterns for Cadence** in both docs

### For Syllable Processing
1. Read `hyphen-webworkers-reference.md` → **Hyphen Package** section
2. Review **Syllable Processor Worker** example
3. Implement **Worker Manager** pattern

### For State Management
1. Study `codemirror-reference.md` → **State Management** section
2. Review **StateField** and **StateEffect** patterns
3. See **Facets** section for computed values

---

## 🔍 Finding Specific Information

### Custom Gutters
- **File:** `codemirror-reference.md`
- **Sections:** Gutters API → Custom Gutter Definition, GutterMarker Class
- **Pattern:** Common Patterns for Cadence → Pattern 1

### Decorations for Syllable Markers
- **File:** `codemirror-reference.md`
- **Sections:** Decorations API → Mark Decoration, MatchDecorator
- **Pattern:** Common Patterns for Cadence → Pattern 2

### React Integration
- **File:** `react-codemirror-reference.md`
- **Sections:** Component Props, Extensions, Examples
- **Pattern:** Common Patterns for Cadence (all patterns)

### Web Worker Setup
- **File:** `hyphen-webworkers-reference.md`
- **Sections:** Web Workers API, TypeScript Web Worker Pattern, Vite Configuration
- **Example:** Cadence-Specific Implementation

### Syllable Counting
- **File:** `hyphen-webworkers-reference.md`
- **Section:** Hyphen Package → Example: Counting Syllables
- **Formula:** `syllables = softHyphens + 1`

---

## 📖 Code Examples by Feature

### Feature 1: Syllable Gutter
**References:**
- `codemirror-reference.md` → Gutters API → Custom Gutter Definition
- `codemirror-reference.md` → Common Patterns → Pattern 1
- `react-codemirror-reference.md` → Common Patterns → Pattern 1

### Feature 2: Inline Syllable Markers
**References:**
- `codemirror-reference.md` → Decorations API → Mark Decoration
- `codemirror-reference.md` → MatchDecorator
- `codemirror-reference.md` → Common Patterns → Pattern 2

### Feature 3: Smart Formatting
**References:**
- `codemirror-reference.md` → Decorations API → MatchDecorator
- `codemirror-reference.md` → View Plugins → View Plugin with Decorations

### Feature 4: Async Syllable Processing
**References:**
- `hyphen-webworkers-reference.md` → Complete document
- `codemirror-reference.md` → State Management → StateField

### Feature 5: Paste Handling
**References:**
- `codemirror-reference.md` → Event Handling → DOM Event Handlers
- `codemirror-reference.md` → Common Patterns → Pattern 3

---

## 🛠️ Implementation Order

Based on the documentation, implement features in this order:

1. **Basic Editor Setup** (Day 1)
   - Reference: `react-codemirror-reference.md` → Basic Usage
   - Create basic React component with CodeMirror

2. **Syllable Processing** (Day 2)
   - Reference: `hyphen-webworkers-reference.md` → Syllable Processor Worker
   - Implement Web Worker for hyphenation

3. **Gutter Display** (Day 3)
   - Reference: `codemirror-reference.md` → Gutters API
   - Create custom syllable gutter

4. **State Integration** (Day 4)
   - Reference: `codemirror-reference.md` → State Management
   - Connect worker results to gutter via StateField

5. **Inline Markers** (Day 5)
   - Reference: `codemirror-reference.md` → Decorations API
   - Add syllable separators

6. **Smart Formatting** (Day 6)
   - Reference: `codemirror-reference.md` → MatchDecorator
   - Pattern matching for sections/chords/comments

7. **Polish** (Day 7-8)
   - Reference: All docs → Best Practices sections
   - Performance optimization, error handling

---

## 📝 Key Concepts Summary

### CodeMirror Architecture
- **Immutable State** - Never mutate editor state
- **Transactions** - All changes via transactions
- **Extensions** - Modular, composable functionality
- **Decorations** - Visual markup without DOM manipulation
- **Facets** - Computed values from state

### React Integration
- **Controlled Components** - State synchronization
- **Refs** - Access to view/state
- **Extensions Array** - Pass via props
- **Memoization** - Prevent unnecessary re-renders

### Web Workers
- **Message Passing** - Structured cloning
- **Type Safety** - Typed request/response
- **Promise Wrapper** - Async/await pattern
- **Error Handling** - Reject pending requests

### Hyphen Package
- **Soft Hyphens** - `\u00AD` character
- **Syllable Formula** - Count hyphens + 1
- **Async API** - Returns Promise
- **HTML Support** - Skips tags automatically

---

## 🎨 Visual Reference

### Editor Structure
```
┌─────────────────────────────────────┐
│ cm-editor                           │
│ ┌─────────────────────────────────┐ │
│ │ cm-scroller                     │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ cm-gutters                  │ │ │
│ │ │ ┌────────┐                  │ │ │
│ │ │ │ Custom │  cm-content      │ │ │
│ │ │ │ Gutter │  (editable)      │ │ │
│ │ │ └────────┘                  │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Data Flow
```
User Types
    ↓
Editor Updates
    ↓
Debounce (300ms)
    ↓
Extract Lines
    ↓
Web Worker (hyphen/en)
    ↓
Count Syllables
    ↓
Update StateField
    ↓
Render Gutter + Decorations
```

---

## ⚠️ Important Notes

### Vite Configuration
- Web Workers work out-of-the-box with Vite
- Use `new URL('./worker.ts', import.meta.url)` pattern
- No special webpack config needed

### TypeScript
- Include `"WebWorker"` in lib for worker files
- Use separate interfaces for request/response
- Type all message events

### Performance
- Debounce editor changes (300ms recommended)
- Batch worker requests
- Cache hyphenation results
- Use viewport-only rendering

### Browser Support
- All modern browsers support Web Workers
- Soft hyphens (`\u00AD`) are universally supported
- CodeMirror 6 targets ES2018+

---

## 🔗 External Resources

While these docs are comprehensive, you may also reference:

- **CodeMirror Official:** https://codemirror.net/
- **hyphen on npm:** https://www.npmjs.com/package/hyphen
- **MDN Web Workers:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
- **Vite Documentation:** https://vitejs.dev/

---

## 📦 Dependencies Reference

All documentation covers these packages:

```json
{
  "dependencies": {
    "@uiw/react-codemirror": "^4.23.5",
    "@codemirror/view": "^6.35.0",
    "@codemirror/state": "^6.4.1",
    "@codemirror/language": "^6.10.3",
    "hyphen": "^1.10.6"
  },
  "devDependencies": {
    "@types/hyphen": "^1.3.0",
    "typescript": "^5.6.3",
    "vite": "^6.0.3"
  }
}
```

---

## ✅ Documentation Coverage

- ✅ **CodeMirror Core API** - 10,000+ tokens
- ✅ **React CodeMirror Integration** - 5,000+ tokens  
- ✅ **Hyphen Package Usage** - Complete reference
- ✅ **Web Workers Implementation** - Full patterns
- ✅ **TypeScript Types** - All interfaces documented
- ✅ **Best Practices** - For all technologies
- ✅ **Code Examples** - 50+ examples
- ✅ **Cadence-Specific Patterns** - Ready to implement

**Total Documentation:** ~20,000 words / 3 comprehensive reference files

---

**Ready to build! All necessary documentation is saved and organized.**
