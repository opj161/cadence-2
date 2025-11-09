# React CodeMirror (@uiw/react-codemirror) Reference

> Downloaded from Context7 on November 9, 2025
> 
> This document contains the React integration documentation for CodeMirror 6.

---

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [Component Props](#component-props)
4. [Hooks API](#hooks-api)
5. [Extensions](#extensions)
6. [Themes](#themes)
7. [Examples](#examples)

---

## Installation

```bash
npm install @uiw/react-codemirror --save
```

### Optional Extensions

```bash
# Basic setup extensions
npm install @uiw/codemirror-extensions-basic-setup --save

# Language support
npm install @codemirror/lang-javascript --save

# Themes
npm install @uiw/codemirror-theme-github --save
```

---

## Basic Usage

### Simple Editor

```jsx
import CodeMirror from '@uiw/react-codemirror';

function App() {
  return (
    <CodeMirror
      value="console.log('hello world!');"
      height="200px"
      onChange={(value, viewUpdate) => {
        console.log('value:', value);
      }}
    />
  );
}

export default App;
```

### With Language Support

```jsx
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

function App() {
  return (
    <CodeMirror
      value="console.log('hello world!');"
      height="200px"
      extensions={[javascript({ jsx: true })]}
      onChange={(value, viewUpdate) => {
        console.log('value:', value);
      }}
    />
  );
}

export default App;
```

### With Theme

```jsx
import CodeMirror from '@uiw/react-codemirror';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { javascript } from '@codemirror/lang-javascript';

function App() {
  return (
    <CodeMirror
      value="console.log('hello world!');"
      height="200px"
      theme={githubLight}
      extensions={[javascript({ jsx: true })]}
      onChange={(value, viewUpdate) => {
        console.log('value:', value);
      }}
    />
  );
}

export default App;
```

---

## Component Props

### ReactCodeMirrorProps (TypeScript)

```typescript
interface ReactCodeMirrorProps
  extends Omit<EditorStateConfig, 'doc' | 'extensions'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'placeholder'> {
  
  /** Value of the editor */
  value?: string;
  
  /** Editor dimensions */
  height?: string;
  minHeight?: string;
  maxHeight?: string;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  
  /** Focus on the editor on mount */
  autoFocus?: boolean;
  
  /** Placeholder text when editor is empty */
  placeholder?: string | HTMLElement;
  
  /** Theme configuration
   * @default 'light'
   */
  theme?: 'light' | 'dark' | Extension;
  
  /** Enable basic setup
   * @default true
   */
  basicSetup?: boolean | BasicSetupOptions;
  
  /** Enable editing
   * @default true
   */
  editable?: boolean;
  
  /** Read-only mode
   * @default false
   */
  readOnly?: boolean;
  
  /** Tab key behavior
   * @default true
   */
  indentWithTab?: boolean;
  
  /** Fired when document changes */
  onChange?(value: string, viewUpdate: ViewUpdate): void;
  
  /** Statistics about the editor */
  onStatistics?(data: Statistics): void;
  
  /** First time the editor is created */
  onCreateEditor?(view: EditorView, state: EditorState): void;
  
  /** Fired on any state change */
  onUpdate?(viewUpdate: ViewUpdate): void;
  
  /** CodeMirror extensions */
  extensions?: Extension[];
  
  /** Root element (for shadow DOM) */
  root?: ShadowRoot | Document;
  
  /** Initialize from JSON state */
  initialState?: {
    json: any;
    fields?: Record<string, StateField<any>>;
  };
}
```

### ReactCodeMirrorRef

```typescript
interface ReactCodeMirrorRef {
  editor?: HTMLDivElement | null;
  state?: EditorState;
  view?: EditorView;
}
```

**Usage:**

```jsx
import { useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';

function App() {
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const handleClick = () => {
    if (editorRef.current?.view) {
      console.log(editorRef.current.view.state.doc.toString());
    }
  };

  return (
    <>
      <CodeMirror ref={editorRef} value="hello" />
      <button onClick={handleClick}>Get Content</button>
    </>
  );
}
```

---

## Hooks API

### useCodeMirror Hook

```typescript
interface UseCodeMirror extends ReactCodeMirrorProps {
  container?: HTMLDivElement | null;
}

function useCodeMirror(props: UseCodeMirror): {
  state: EditorState | undefined;
  setState: Dispatch<SetStateAction<EditorState | undefined>>;
  view: EditorView | undefined;
  setView: Dispatch<SetStateAction<EditorView | undefined>>;
  container: HTMLDivElement | null | undefined;
  setContainer: Dispatch<SetStateAction<HTMLDivElement | null | undefined>>;
}
```

**Usage:**

```jsx
import { useEffect, useRef } from 'react';
import { useCodeMirror } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

function MyEditor() {
  const editor = useRef();
  const { setContainer } = useCodeMirror({
    container: editor.current,
    extensions: [javascript()],
    value: 'console.log("hello");',
  });

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
  }, [editor.current]);

  return <div ref={editor} />;
}
```

---

## Extensions

### Basic Setup Extension

The `basicSetup` extension bundles numerous useful CodeMirror extensions:

#### BasicSetupOptions Interface

```typescript
interface BasicSetupOptions extends MinimalSetupOptions {
  lineNumbers?: boolean;
  highlightActiveLineGutter?: boolean;
  foldGutter?: boolean;
  dropCursor?: boolean;
  allowMultipleSelections?: boolean;
  indentOnInput?: boolean;
  bracketMatching?: boolean;
  closeBrackets?: boolean;
  autocompletion?: boolean;
  rectangularSelection?: boolean;
  crosshairCursor?: boolean;
  highlightActiveLine?: boolean;
  highlightSelectionMatches?: boolean;
  closeBracketsKeymap?: boolean;
  searchKeymap?: boolean;
  foldKeymap?: boolean;
  completionKeymap?: boolean;
  lintKeymap?: boolean;
  tabSize?: number;  // Default: 2
}
```

#### Included Features

- Default command bindings
- Line numbers
- Special character highlighting
- Undo history
- Fold gutter
- Custom selection drawing
- Drop cursor
- Multiple selections
- Reindentation on input
- Default highlight style
- Bracket matching
- Bracket closing
- Autocompletion
- Rectangular selection & crosshair cursor
- Active line highlighting
- Active line gutter highlighting
- Selection match highlighting
- Search
- Linting

#### Usage in React

```jsx
import CodeMirror from '@uiw/react-codemirror';

function App() {
  return (
    <CodeMirror
      value="console.log('hello world!');"
      height="200px"
      basicSetup={{
        foldGutter: false,
        dropCursor: false,
        allowMultipleSelections: false,
        indentOnInput: false,
        lineNumbers: true,
        tabSize: 4,
      }}
    />
  );
}
```

#### Standalone Usage

```javascript
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { basicSetup } from '@uiw/codemirror-extensions-basic-setup';

const state = EditorState.create({
  doc: 'my source code',
  extensions: [
    basicSetup({
      foldGutter: false,
      dropCursor: false,
    }),
  ],
});

const view = new EditorView({
  parent: document.querySelector('#editor'),
  state,
});
```

### Minimal Setup Extension

Lighter alternative to basicSetup:

```typescript
interface MinimalSetupOptions {
  highlightSpecialChars?: boolean;
  history?: boolean;
  drawSelection?: boolean;
  syntaxHighlighting?: boolean;
  defaultKeymap?: boolean;
  historyKeymap?: boolean;
}
```

**Includes:**
- Default keymap
- Undo history
- Special character highlighting
- Custom selection drawing
- Default highlight style

### Custom Extensions

```jsx
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';

const myTheme = EditorView.theme({
  '&': {
    fontSize: '16px',
  },
  '.cm-content': {
    fontFamily: 'Menlo, Monaco, Courier New, monospace',
  },
});

function App() {
  return (
    <CodeMirror
      value="console.log('hello');"
      extensions={[
        javascript({ jsx: true }),
        myTheme,
      ]}
    />
  );
}
```

---

## Themes

### Built-in Theme Options

```jsx
import CodeMirror from '@uiw/react-codemirror';

function App() {
  return (
    <CodeMirror
      value="hello"
      theme="dark"  // 'light' | 'dark' | 'none'
    />
  );
}
```

### Using Theme Packages

```jsx
import CodeMirror from '@uiw/react-codemirror';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { aura } from '@uiw/codemirror-theme-aura';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <CodeMirror
      value="console.log('hello');"
      theme={darkMode ? githubDark : githubLight}
    />
  );
}
```

### Custom Theme

```jsx
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';

const myTheme = EditorView.theme({
  '&': {
    color: 'white',
    backgroundColor: '#034'
  },
  '.cm-content': {
    caretColor: '#0e9'
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: '#0e9'
  },
  '&.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: '#074'
  },
  '.cm-gutters': {
    backgroundColor: '#045',
    color: '#ddd',
    border: 'none'
  }
}, { dark: true });

function App() {
  return (
    <CodeMirror
      value="hello"
      theme={myTheme}
    />
  );
}
```

---

## Examples

### Controlled Component

```jsx
import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

function App() {
  const [value, setValue] = useState("console.log('hello world!');");

  const onChange = React.useCallback((val, viewUpdate) => {
    console.log('val:', val);
    setValue(val);
  }, []);

  return (
    <CodeMirror
      value={value}
      height="200px"
      extensions={[javascript({ jsx: true })]}
      onChange={onChange}
    />
  );
}
```

### With Custom Extensions

```jsx
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';

function App() {
  const customExtension = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      console.log('Document changed!');
    }
  });

  return (
    <CodeMirror
      value="console.log('hello');"
      extensions={[
        javascript({ jsx: true }),
        customExtension,
      ]}
    />
  );
}
```

### Read-Only Editor

```jsx
import CodeMirror from '@uiw/react-codemirror';

function App() {
  return (
    <CodeMirror
      value="This is read-only"
      readOnly={true}
      editable={false}
    />
  );
}
```

### With Placeholder

```jsx
import CodeMirror from '@uiw/react-codemirror';

function App() {
  return (
    <CodeMirror
      value=""
      placeholder="Enter your code here..."
      height="200px"
    />
  );
}
```

### Auto Focus

```jsx
import CodeMirror from '@uiw/react-codemirror';

function App() {
  return (
    <CodeMirror
      value="console.log('hello');"
      autoFocus={true}
    />
  );
}
```

### Access View and State

```jsx
import { useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';

function App() {
  const editorRef = useRef();

  const handleGetContent = () => {
    const view = editorRef.current?.view;
    if (view) {
      const content = view.state.doc.toString();
      console.log(content);
    }
  };

  const handleSetSelection = () => {
    const view = editorRef.current?.view;
    if (view) {
      view.dispatch({
        selection: { anchor: 0, head: 5 }
      });
      view.focus();
    }
  };

  return (
    <>
      <CodeMirror
        ref={editorRef}
        value="hello world"
      />
      <button onClick={handleGetContent}>Get Content</button>
      <button onClick={handleSetSelection}>Select First 5 Chars</button>
    </>
  );
}
```

### Lifecycle Hooks

```jsx
import CodeMirror from '@uiw/react-codemirror';

function App() {
  const onCreateEditor = (view, state) => {
    console.log('Editor created!', view, state);
  };

  const onUpdate = (viewUpdate) => {
    console.log('Editor updated!', viewUpdate);
  };

  const onStatistics = (data) => {
    console.log('Statistics:', data);
  };

  return (
    <CodeMirror
      value="hello"
      onCreateEditor={onCreateEditor}
      onUpdate={onUpdate}
      onStatistics={onStatistics}
    />
  );
}
```

### Dynamic Height

```jsx
import CodeMirror from '@uiw/react-codemirror';

function App() {
  return (
    <CodeMirror
      value="Line 1\nLine 2\nLine 3"
      height="auto"
      minHeight="100px"
      maxHeight="400px"
    />
  );
}
```

### With Custom Styling

```jsx
import CodeMirror from '@uiw/react-codemirror';

function App() {
  return (
    <CodeMirror
      value="hello"
      style={{
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
      className="my-custom-editor"
    />
  );
}
```

---

## Common Patterns for Cadence

### Pattern 1: Editor with Custom Gutter Extension

```jsx
import { useState, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { syllableGutterExtension } from './extensions/syllableGutter';

function LyricEditor() {
  const [value, setValue] = useState('');

  const onChange = useCallback((val) => {
    setValue(val);
  }, []);

  const extensions = [
    syllableGutterExtension,
    EditorView.lineWrapping,
  ];

  return (
    <CodeMirror
      value={value}
      height="600px"
      extensions={extensions}
      onChange={onChange}
      placeholder="Start writing your lyrics..."
    />
  );
}
```

### Pattern 2: Editor with Multiple Custom Extensions

```jsx
import { useState, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { syllableGutter } from './extensions/syllableGutter';
import { syllableDecorations } from './extensions/syllableDecorations';
import { smartFormatting } from './extensions/smartFormatting';
import { pasteHandler } from './extensions/pasteHandler';

function LyricEditor() {
  const [value, setValue] = useState('');

  const extensions = [
    syllableGutter,
    syllableDecorations,
    smartFormatting,
    pasteHandler,
  ];

  return (
    <CodeMirror
      value={value}
      height="100%"
      extensions={extensions}
      onChange={(val) => setValue(val)}
      basicSetup={{
        lineNumbers: false,  // We have custom gutter
        foldGutter: false,
        highlightActiveLine: true,
      }}
    />
  );
}
```

### Pattern 3: Editor with Theme Toggle

```jsx
import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';

function LyricEditor() {
  const [value, setValue] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  return (
    <>
      <button onClick={() => setDarkMode(!darkMode)}>
        Toggle Theme
      </button>
      <CodeMirror
        value={value}
        theme={darkMode ? githubDark : githubLight}
        onChange={setValue}
      />
    </>
  );
}
```

---

## Best Practices

1. **Use `useCallback` for event handlers** - Prevents unnecessary re-renders
2. **Memoize extensions array** - Use `useMemo` to avoid recreating extensions
3. **Access view via ref** - For imperative operations like focus, selection
4. **Control vs Uncontrolled** - Use controlled component pattern when state matters
5. **Lazy load language support** - Import language modules dynamically if needed
6. **Custom extensions in separate files** - Keep editor component clean
7. **Theme switching** - Use state to toggle between themes
8. **Height management** - Use `minHeight`/`maxHeight` for flexible layouts
9. **Update listener for heavy operations** - Use `onUpdate` for async operations
10. **Testing** - Use `onCreateEditor` to access view/state in tests

---

**End of React CodeMirror Reference Document**
