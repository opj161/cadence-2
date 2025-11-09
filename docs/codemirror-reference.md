# CodeMirror 6 API Reference

> Downloaded from Context7 on November 9, 2025
> 
> This document contains essential CodeMirror 6 documentation for building the Cadence application.

---

## Table of Contents

1. [Editor Setup](#editor-setup)
2. [Extensions & Configuration](#extensions--configuration)
3. [Gutters API](#gutters-api)
4. [Decorations API](#decorations-api)
5. [State Management](#state-management)
6. [View Plugins](#view-plugins)
7. [Facets](#facets)
8. [Event Handling](#event-handling)

---

## Editor Setup

### Minimal CodeMirror Editor Setup

Basic initialization of a CodeMirror 6 editor:

```javascript
import {EditorState} from "@codemirror/state"
import {EditorView, keymap} from "@codemirror/view"
import {defaultKeymap} from "@codemirror/commands"

let startState = EditorState.create({
  doc: "Hello World",
  extensions: [keymap.of(defaultKeymap)]
})

let view = new EditorView({
  state: startState,
  parent: document.body
})
```

### Editor with Basic Setup and JavaScript Support

```javascript
import {EditorView, basicSetup} from "codemirror"
import {javascript} from "@codemirror/lang-javascript"

let view = new EditorView({
  extensions: [basicSetup, javascript()],
  parent: document.body
})
```

### EditorViewConfig Interface

```typescript
interface EditorViewConfig extends EditorStateConfig {
    state?: EditorState
    parent?: Element | DocumentFragment
    root?: Document | ShadowRoot
    scrollTo?: StateEffect<any>
    dispatchTransactions?: (trs: readonly Transaction[], view: EditorView) => void
    dispatch?: (tr: Transaction, view: EditorView) => void
}
```

---

## Extensions & Configuration

### Extension Type Definition

```typescript
type Extension = {extension: Extension} | readonly Extension[]
```

Extensions can be nested arbitrarily deep and will be flattened during processing.

### Configuring Extensions with Compartments

Dynamically manage editor configurations like tab size using compartments:

```javascript
let tabSize = new Compartment

let view = new EditorView({
  extensions: [
    // ...
    tabSize.of(EditorState.tabSize.of(2))
  ],
  // ...
})

function setTabSize(size) {
  view.dispatch({
    effects: tabSize.reconfigure(EditorState.tabSize.of(size))
  })
}
```

### Extension Precedence

```javascript
import {keymap} from "@codemirror/view"
import {EditorState, Prec} from "@codemirror/state"

function dummyKeymap(tag) {
  return keymap.of([{ 
    key: "Ctrl-Space",
    run() { console.log(tag); return true }
  }])
}

let state = EditorState.create({extensions: [
  dummyKeymap("A"),
  dummyKeymap("B"),
  Prec.high(dummyKeymap("C"))  // This will be handled first
]})
```

---

## Gutters API

### Line Number Gutter

```typescript
function lineNumbers(config?: {
    formatNumber?: (lineNo: number, state: EditorState) => string,
    domEventHandlers?: { [key: string]: (view: EditorView, line: BlockInfo, event: Event) => boolean }
}): Extension
```

**Example:**
```javascript
import { lineNumbers } from "@codemirror/view"

const view = new EditorView({
  extensions: [
    lineNumbers({
      formatNumber: (lineNo) => `${lineNo}:`,
      domEventHandlers: {
        click: (view, line, event) => {
          console.log(`Line ${line.number} clicked`);
          return false;
        }
      }
    })
  ]
})
```

### Custom Gutter Definition

```typescript
function gutter(config: {
    class?: string,
    renderEmptyElements?: boolean,
    markers?: (view: EditorView) => RangeSet<GutterMarker> | readonly RangeSet<GutterMarker>[],
    lineMarker?: (view: EditorView, line: BlockInfo, otherMarkers: readonly GutterMarker[]) => GutterMarker | null,
    widgetMarker?: (view: EditorView, widget: WidgetType, block: BlockInfo) => GutterMarker | null,
    lineMarkerChange?: (update: ViewUpdate) => boolean,
    initialSpacer?: (view: EditorView) => GutterMarker,
    updateSpacer?: (spacer: GutterMarker, update: ViewUpdate) => GutterMarker,
    domEventHandlers?: { [key: string]: (view: EditorView, line: BlockInfo, event: Event) => boolean },
    side?: "before" | "after"
}): Extension
```

### GutterMarker Class

```typescript
abstract class GutterMarker extends RangeValue {
    eq(other: GutterMarker): boolean
    toDOM?(view: EditorView): Node
    elementClass: string
    destroy(dom: Node)
}
```

**Custom Marker Example:**
```javascript
class SyllableMarker extends GutterMarker {
  constructor(count, isActive) {
    super();
    this.count = count;
    this.isActive = isActive;
  }

  toDOM() {
    const span = document.createElement("span");
    span.textContent = String(this.count);
    span.className = this.isActive 
      ? "syllable-count syllable-count-active" 
      : "syllable-count";
    return span;
  }

  eq(other) {
    return this.count === other.count && this.isActive === other.isActive;
  }
}
```

### Highlight Active Line Gutter

```typescript
function highlightActiveLineGutter(): Extension
```

Returns an extension that adds a `cm-activeLineGutter` class to all gutter elements on the active line.

### Gutter Configuration

```typescript
function gutters(config?: { fixed?: boolean }): Extension
```

The gutter-drawing plugin is automatically enabled when you add a gutter. `fixed: true` (default) means gutters don't scroll with content.

### Gutter Facets

```typescript
static gutterLineClass: Facet<RangeSet<GutterMarker>>
static gutterWidgetClass: Facet<(view: EditorView, widget: WidgetType, block: BlockInfo) => GutterMarker | null>
static lineNumberMarkers: Facet<RangeSet<GutterMarker>>
static lineNumberWidgetMarker: Facet<(view: EditorView, widget: WidgetType, block: BlockInfo) => GutterMarker | null>
```

---

## Decorations API

### Decorations Facet

```typescript
static decorations: Facet<DecorationSet | fn(view: EditorView) → DecorationSet>
```

A facet that determines which decorations are shown in the view. Decorations can be provided directly or via a function.

### Managing Decorations with StateField

```javascript
import {StateField, StateEffect} from "@codemirror/state"
import {EditorView, Decoration} from "@codemirror/view"

// Effects can be attached to transactions to communicate with the extension
const addMarks = StateEffect.define()
const filterMarks = StateEffect.define()

// This value must be added to the set of extensions to enable this
const markField = StateField.define({
  // Start with an empty set of decorations
  create() { return Decoration.none },
  // This is called whenever the editor updates—it computes the new set
  update(value, tr) {
    // Move the decorations to account for document changes
    value = value.map(tr.changes)
    // If this transaction adds or removes decorations, apply those changes
    for (let effect of tr.effects) {
      if (effect.is(addMarks)) value = value.update({add: effect.value, sort: true})
      else if (effect.is(filterMarks)) value = value.update({filter: effect.value})
    }
    return value
  },
  // Indicate that this field provides a set of decorations
  provide: f => EditorView.decorations.from(f)
})
```

### Decoration Types

#### Mark Decoration

Creates a mark decoration that influences the styling of content within its range:

```javascript
Decoration.mark({
  inclusive: true,
  attributes: { class: "cm-bold" },
  tagName: "strong"
})
```

#### Widget Decoration

Creates a widget decoration, which inserts a DOM element at a specific position:

```javascript
Decoration.widget({
  widget: myWidgetInstance,
  side: 10,
  block: false
})
```

#### Replace Decoration

Creates a replace decoration, which replaces a range of content with a widget or simply hides it:

```javascript
Decoration.replace({
  widget: myWidgetInstance,
  inclusive: true,
  block: true
})
```

#### Line Decoration

Creates a line decoration that adds DOM attributes to the line:

```javascript
Decoration.line({
  attributes: { class: "cm-error-line" }
})
```

### MatchDecorator

Helper class for creating and updating decorations based on pattern matching:

```typescript
class MatchDecorator {
  createDeco(view: EditorView): RangeSet<Decoration>
  updateDeco(update: ViewUpdate, deco: DecorationSet): DecorationSet
}
```

**Example Usage:**
```javascript
const myDecorator = new MatchDecorator({
  regexp: /\b(TODO|FIXME)\b/g,
  decoration: Decoration.mark({ class: "cm-keyword-highlight" })
});

// In a view plugin:
let decorations = myDecorator.createDeco(editorView);
// On update:
decorations = myDecorator.updateDeco(update, decorations);
```

### Adding Decorations Example

```javascript
const strikeMark = Decoration.mark({
  attributes: {style: "text-decoration: line-through"}
})

view.dispatch({
  effects: addMarks.of([strikeMark.range(1, 4)])
})
```

---

## State Management

### EditorState Creation

```typescript
static create(config?: EditorStateConfig): EditorState
```

### Creating State with Selections

```javascript
import {EditorState, EditorSelection} from "@codemirror/state"

let state = EditorState.create({
  doc: "hello",
  selection: EditorSelection.create([
    EditorSelection.range(0, 4),
    EditorSelection.cursor(5)
  ]),
  extensions: EditorState.allowMultipleSelections.of(true)
})
console.log(state.selection.ranges.length) // 2
```

### Dispatching Transactions

```javascript
// Modify document content
view.dispatch({ 
  changes: {from: 0, to: view.state.doc.length, insert: text} 
})

// Modify selection
view.dispatch({
  selection: {anchor: pos}
})

view.dispatch({
  selection: {anchor, head}
})

view.dispatch({ 
  selection: EditorSelection.create(ranges) 
})
```

### State Update with changeByRange

```javascript
let state = EditorState.create({doc: "abcd", selection: {anchor: 1, head: 3}})

// Upcase the selection
let tr = state.update(state.changeByRange(range => {
  let upper = state.sliceDoc(range.from, range.to).toUpperCase()
  return {
    changes: {from: range.from, to: range.to, insert: upper},
    range: EditorSelection.range(range.from, range.from + upper.length)
  }
}))
console.log(tr.state.doc.toString()) // "aBCd"
```

### StateField

```typescript
StateField.define<Value>({
  create: (state: EditorState) => Value,
  update: (value: Value, transaction: Transaction) => Value,
  provide?: (field: StateField<Value>) => Extension
})
```

### State Commands

```typescript
type StateCommand = fn(
  target: {state: EditorState, dispatch: fn(transaction: Transaction)}
) → boolean
```

---

## View Plugins

### Define View Plugin with Constructor Function

```typescript
static define<V extends PluginValue, Arg = undefined>(
  create: fn(view: EditorView, arg: Arg) → V,
  spec?: PluginSpec<V>
) → ViewPlugin<V, Arg>
```

### Define View Plugin from Class

```typescript
static fromClass<V extends PluginValue, Arg = undefined>(
  cls: {new (view: EditorView, arg: Arg) → V},
  spec?: PluginSpec<V>
) → ViewPlugin<V, Arg>
```

### View Plugin Example

```javascript
import {ViewPlugin} from "@codemirror/view"

const docSizePlugin = ViewPlugin.fromClass(class {
  constructor(view) {
    this.dom = view.dom.appendChild(document.createElement("div"))
    this.dom.style.cssText =
      "position: absolute; inset-block-start: 2px; inset-inline-end: 5px"
    this.dom.textContent = view.state.doc.length
  }

  update(update) {
    if (update.docChanged)
      this.dom.textContent = update.state.doc.length
  }

  destroy() { 
    this.dom.remove() 
  }
})
```

### View Plugin with Decorations

```javascript
const myPlugin = ViewPlugin.fromClass(class {
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
    // Build decoration set...
    return Decoration.set(builder, true);
  }
}, {
  decorations: v => v.decorations
});
```

---

## Facets

### Facet Definition

```typescript
static define<Input, Output = readonly Input[]>(config?: {
  combine?: fn(value: readonly Input[]) → Output,
  compare?: fn(a: Output, b: Output) → boolean,
  compareInput?: fn(a: Input, b: Input) → boolean,
  static?: boolean,
  enables?: Extension | fn(self: Facet<Input, Output>) → Extension
}): Facet<Input, Output>
```

### Facet Methods

```typescript
// Get a facet reader
reader(): FacetReader<Output>

// Add value to facet
of(value: Input): Extension

// Compute value from state
compute(
  deps: readonly (StateField<any> | "doc" | "selection" | FacetReader<any>)[], 
  get: fn(state: EditorState) => Input
): Extension

// Compute multiple values from state
computeN(
  deps: readonly (StateField<any> | "doc" | "selection" | FacetReader<any>)[], 
  get: fn(state: EditorState) => readonly Input[]
): Extension

// Get value from state field
from<T extends Input>(field: StateField<T>): Extension
from<T>(field: StateField<T>, get: fn(value: T) => Input): Extension
```

### Built-in Facets

```typescript
// State facets
EditorState.tabSize: Facet<number, number>
EditorState.lineSeparator: Facet<string, string | undefined>
EditorState.readOnly: Facet<boolean, boolean>
EditorState.allowMultipleSelections: Facet<boolean, boolean>
EditorState.phrases: Facet<Object<string>>
EditorState.languageData: Facet<fn(state, pos, side) -> readonly Object<any>[]>
EditorState.changeFilter: Facet<fn(tr: Transaction) -> boolean | readonly number[]>
EditorState.transactionFilter: Facet<fn(tr: Transaction) -> TransactionSpec | readonly TransactionSpec[]>
EditorState.transactionExtender: Facet<fn(tr: Transaction) -> Pick<TransactionSpec, "effects" | "annotations"> | null>

// View facets
EditorView.decorations: Facet<DecorationSet | fn(view: EditorView) => DecorationSet>
EditorView.styleModule: Facet<StyleModule>
EditorView.updateListener: Facet<fn(update: ViewUpdate)>
EditorView.editable: Facet<boolean>
```

---

## Event Handling

### DOM Event Handlers

```typescript
static domEventHandlers(handlers: DOMEventHandlers<any>): Extension
```

**Example:**
```javascript
import {EditorView} from "@codemirror/view";

const handlers = {
  click(event, view) {
    console.log("Editor clicked!", event);
    return false; // Return true to prevent default
  },
  keydown(event, view) {
    if (event.key === "Enter" && event.ctrlKey) {
      // Handle Ctrl+Enter
      return true;
    }
    return false;
  }
};

const view = new EditorView({
  extensions: [EditorView.domEventHandlers(handlers)]
});
```

### DOM Event Observers

For consistently called event handlers even if other handlers processed them:

```javascript
const myEventObserver = EditorView.domEventObservers({
  click(view, event) {
    console.log("Click observed");
    // This will always be called
  }
});

const myPlugin = ViewPlugin.fromClass(class {
  constructor(view) {
    this.view = view;
  }
}, {
  eventObservers: myEventObserver
});
```

### Update Listener

```typescript
EditorView.updateListener.of((update: ViewUpdate) => {
  if (update.docChanged) {
    console.log("Document changed");
  }
  if (update.selectionSet) {
    console.log("Selection changed");
  }
})
```

---

## Editor View Methods

### Common Methods

```typescript
// Get screen coordinates at document position
coordsForChar(pos: number): Rect | null

// Focus management
hasFocus: boolean
focus(): void

// Set tab focus mode
setTabFocusMode(to?: boolean | number): void

// Update root
setRoot(root: Document | ShadowRoot): void

// Cleanup
destroy(): void
```

### Properties

```typescript
defaultCharacterWidth: number
defaultLineHeight: number
textDirection: Direction
lineWrapping: boolean
composing: boolean  // IME composition status
```

---

## Useful Extensions

### Scroll Past End

```typescript
scrollPastEnd(): Extension
```

Ensures all lines can be scrolled to the top by adding bottom margin.

### Drop Cursor

```typescript
dropCursor(): Extension
```

Adds a visual cursor at the drop position when dragging content.

### Placeholder

```javascript
import { placeholder } from "@codemirror/view";

const editor = new EditorView({
  extensions: [placeholder("Enter your text here...")]
});
```

### Draw Selection

```javascript
import { drawSelection } from "@codemirror/view";

const editor = new EditorView({
  extensions: [drawSelection()]
});
```

---

## Theming

### Base Theme

```javascript
EditorView.baseTheme({
  '&dark .first-line': { backgroundColor: 'red' },
  '&light .first-line': { backgroundColor: 'red' },
  '.cm-content': { fontFamily: 'monospace' }
})
```

### Custom Theme Extension

```javascript
const myTheme = EditorView.theme({
  '&': { height: '400px' },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-content': { padding: '10px' },
  '&.cm-focused .cm-cursor': { borderLeftColor: '#0e9' }
}, { dark: true })
```

---

## DOM Structure

```html
<div class="cm-editor [theme scope classes]">
  <div class="cm-scroller">
    <div class="cm-content" contenteditable="true">
      <div class="cm-line">Content goes here</div>
      <div class="cm-line">...</div>
    </div>
  </div>
</div>
```

---

## Best Practices

1. **Use StateFields for storing state** - Don't store mutable state outside the editor state
2. **Use Effects for communication** - Define StateEffects for updating extensions
3. **Provide decorations efficiently** - Use the provide option in StateField
4. **Handle document changes** - Always map decorations/positions when document changes
5. **Use compartments for dynamic config** - Reconfigure extensions without recreating the editor
6. **Avoid accessing Transaction.state** in filters - Can cause infinite loops
7. **Clean up in destroy()** - Always remove DOM elements and listeners in view plugin destroy
8. **Use MatchDecorator for patterns** - Efficient for regex-based decorations
9. **Debounce expensive operations** - Don't run heavy computations on every keystroke
10. **Test with large documents** - Ensure performance with documents > 1000 lines

---

## Common Patterns for Cadence

### Pattern 1: Custom Gutter with State

```javascript
const syllableCountEffect = StateEffect.define()

const syllableCountField = StateField.define({
  create: () => new Map(),
  update: (counts, tr) => {
    for (let effect of tr.effects) {
      if (effect.is(syllableCountEffect)) {
        return effect.value;
      }
    }
    return counts;
  }
})

const syllableGutter = gutter({
  class: "cm-syllable-gutter",
  lineMarker: (view, line) => {
    const counts = view.state.field(syllableCountField);
    const lineNumber = view.state.doc.lineAt(line.from).number;
    const count = counts.get(lineNumber);
    if (!count) return null;
    return new SyllableMarker(count);
  }
})
```

### Pattern 2: Decorations with Pattern Matching

```javascript
const sectionHeaderDecorator = new MatchDecorator({
  regexp: /^\[.*\]$/gm,
  decoration: Decoration.line({ class: "cm-section-header" })
});

const formattingPlugin = ViewPlugin.fromClass(class {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = sectionHeaderDecorator.createDeco(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = sectionHeaderDecorator.updateDeco(update, this.decorations);
    }
  }
}, {
  decorations: v => v.decorations
});
```

### Pattern 3: Custom Paste Handler

```javascript
const pasteHandler = EditorView.domEventHandlers({
  paste(event, view) {
    const text = event.clipboardData?.getData("text/plain");
    if (!text) return false;
    
    const lines = text.split(/\r?\n/);
    if (lines.length > 1) {
      event.preventDefault();
      const { from } = view.state.selection.main;
      view.dispatch({
        changes: { from, insert: lines.join('\n') }
      });
      return true;
    }
    return false;
  }
});
```

---

**End of CodeMirror Reference Document**
