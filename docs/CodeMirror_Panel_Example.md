# CodeMirror Panel Example

## Example: Editor Panels

A “panel”, as supported by the [@codemirror/view](https://codemirror.net/docs/ref/#h_panels) package, is a UI element shown above or below the editor. They will sit inside the editor's vertical space for editors with fixed height. When the editor is partially scrolled out of view, panels will be positioned to stay in view.

This example shows how to add panels to your editor.

## Opening and Closing Panels

The set of panels to show at a given time is determined by the value of the [
```
showPanel
```
](https://codemirror.net/docs/ref/#view.showPanel) facet. To track the current state of our panel, we define this [state field](https://codemirror.net/docs/ref/#state.StateField), with an [effect](https://codemirror.net/docs/ref/#state.StateEffect) to turn it on or off.

```
import {showPanel, Panel} from "@codemirror/view"
import {StateField, StateEffect} from "@codemirror/state"

const toggleHelp = StateEffect.define<boolean>()

const helpPanelState = StateField.define<boolean>({
  create: () => false,
  update(value, tr) {
    for (let e of tr.effects) if (e.is(toggleHelp)) value = e.value
    return value
  },
  provide: f => showPanel.from(f, on => on ? createHelpPanel : null)
})

```

The 
```
provide
```
 option wires this field up to the 
```
showPanel
```
 facet. The 
```
createHelpPanel
```
 function is defined like this:

```
import {EditorView} from "@codemirror/view"

function createHelpPanel(view: EditorView) {
  let dom = document.createElement("div")
  dom.textContent = "F1: Toggle the help panel"
  dom.className = "cm-help-panel"
  return {top: true, dom}
}

```

It's not a very useful panel. The [object](https://codemirror.net/docs/ref/#view.Panel) it returns can, apart from providing the panel's DOM structure, configure whether the panel should be at the top or bottom of the editor.

Next we define a [key binding](https://codemirror.net/docs/ref/#view.KeyBinding) that makes F1 toggle the field on and off.

```
const helpKeymap = [{
  key: "F1",
  run(view) {
    view.dispatch({
      effects: toggleHelp.of(!view.state.field(helpPanelState))
    })
    return true
  }
}]

```

And tie everything together in the 
```
helpPanel
```
 function, which creates the extension that enables the field, the key binding, and a simple styling for the panel.

```
import {keymap} from "@codemirror/view"

const helpTheme = EditorView.baseTheme({
  ".cm-help-panel": {
    padding: "5px 10px",
    backgroundColor: "#fffa8f",
    fontFamily: "monospace"
  }
})

export function helpPanel() {
  return [helpPanelState, keymap.of(helpKeymap), helpTheme]
}

```

## Dynamic Panel Content

It is often necessary to keep the content of a panel in sync with the rest of the editor. For this purpose, the [object](https://codemirror.net/docs/ref/#view.Panel) returned by a panel constructor may have an [
```
update
```
](https://codemirror.net/docs/ref/#view.Panel.update) method that, much like the 
```
update
```
 method in view plugins, gets called every time the editor view updates.

Here we'll build a little extension that sets up a word-counting panel.

First we need a (very crude, entirely Unicode-unaware) function that counts the words in a document.

```
import {Text} from "@codemirror/state"

function countWords(doc: Text) {
  let count = 0, iter = doc.iter()
  while (!iter.next().done) {
    let inWord = false
    for (let i = 0; i < iter.value.length; i++) {
      let word = /\w/.test(iter.value[i])
      if (word && !inWord) count++
      inWord = word
    }
  }
  return `Word count: ${count}`
}

```

Next, a [panel constructor](https://codemirror.net/docs/ref/#view.PanelConstructor) building a panel that re-counts the words every time the document changes.

```
import {EditorView, Panel} from "@codemirror/view"

function wordCountPanel(view: EditorView): Panel {
  let dom = document.createElement("div")
  dom.textContent = countWords(view.state.doc)
  return {
    dom,
    update(update) {
      if (update.docChanged)
        dom.textContent = countWords(update.state.doc)
    }
  }
}

```

And finally, a function that build the extension that enables the panel in an editor.

```
import {showPanel} from "@codemirror/view"

export function wordCounter() {
  return showPanel.of(wordCountPanel)
}

```

Word count: 9