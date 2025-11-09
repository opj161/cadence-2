# List of Core Extension

This document provides an overview of the extensions and options available when [configuring](https://codemirror.net/examples/config/) a CodeMirror editor.

## Editing

### Whitespace

**
```
[tabSize](https://codemirror.net/docs/ref/#state.EditorState^tabSize)
```
** configures the size of a tab (in spaces) in your editor.

**
```
[lineSeparator](https://codemirror.net/docs/ref/#state.EditorState^lineSeparator)
```
** can be used to configure a line separator.

**
```
[indentUnit](https://codemirror.net/docs/ref/#language.indentUnit)
```
** sets the whitespace to add for one level of indentation.

**
```
[indentOnInput](https://codemirror.net/docs/ref/#language.indentOnInput)
```
** configures whether some (language-specific) inputs trigger reindentation of the current line.

### Read-only

There are two facets controlling whether the editor allow modification of its content. Different combinations of these are appropriate in different circumstances.

**
```
[editable](https://codemirror.net/docs/ref/#view.EditorView^editable)
```
** determines whether the editor view behaves like an editable control (showing a cursor, etc).

**
```
[readOnly](https://codemirror.net/docs/ref/#state.EditorState^readOnly)
```
** determines whether editing commands can modify the content.

### Editing Helpers

**
```
[allowMultipleSelections](https://codemirror.net/docs/ref/#state.EditorState^allowMultipleSelections)
```
** can be turned on to allow the selection to have multiple ranges (see also **
```
[drawSelection](https://codemirror.net/docs/ref/#view.drawSelection)
```
**, which actually draws these secondary selections).

**
```
[autocompletion](https://codemirror.net/docs/ref/#autocomplete.autocompletion)
```
** is a set of extensions that enable content hints as the user types (or explicitly queries for completions).

**
```
[closeBrackets](https://codemirror.net/docs/ref/#autocomplete.closeBrackets)
```
** causes matching close brackets to be inserted when the user types an opening bracket.

**
```
[codeFolding](https://codemirror.net/docs/ref/#language.codeFolding)
```
** allows the user to collapse (hide) parts of the document. See also **
```
[foldGutter](https://codemirror.net/docs/ref/#language.foldGutter)
```
**.

**
```
[atomicRanges](https://codemirror.net/docs/ref/#view.EditorView^atomicRanges)
```
**

**
```
[history](https://codemirror.net/docs/ref/#commands.history)
```
** provides an undo/redo history.

**
```
[search](https://codemirror.net/docs/ref/#search.search)
```
** configures the search panel.

## Presentation

### Styling

**
```
[theme](https://codemirror.net/docs/ref/#view.EditorView^theme)
```
** can be used to define a theme (see for example [@codemirror/theme-one-dark](https://github.com/codemirror/theme-one-dark)).

**
```
[baseTheme](https://codemirror.net/docs/ref/#view.EditorView^baseTheme)
```
** defines generic base styling, to be included with extensions that define new UI elements.

**
```
[styleModule](https://codemirror.net/docs/ref/#view.EditorView^styleModule)
```
** is a primitive that allows you to ensure the editor loads a given CSS module.

**
```
[editorAttributes](https://codemirror.net/docs/ref/#view.EditorView^editorAttributes)
```
** adds HTML attributes to the editor's outer DOM element.

**
```
[contentAttributes](https://codemirror.net/docs/ref/#view.EditorView^contentAttributes)
```
** adds attributes to the element holding the editor's content.

**
```
[decorations](https://codemirror.net/docs/ref/#view.EditorView^decorations)
```
** is a primitive for adding styling to the editor's content, used as a building block in various extensions.

### Presentation Features

**
```
[drawSelection](https://codemirror.net/docs/ref/#view.drawSelection)
```
** replaces the native selection with a custom-drawn selection in traditional text editor style, with support for [multiple selection ranges](https://codemirror.net/docs/ref/#state.EditorState^allowMultipleSelections).

**
```
[lineWrapping](https://codemirror.net/docs/ref/#view.EditorView^lineWrapping)
```
** enables line wrapping.

**
```
[highlightActiveLine](https://codemirror.net/docs/ref/#view.highlightActiveLine)
```
** adds an extra style to the line with the cursor (see also **
```
[highlightActiveLineGutter](https://codemirror.net/docs/ref/#view.highlightActiveLineGutter)
```
**).

**
```
[highlightSpecialChars](https://codemirror.net/docs/ref/#view.highlightSpecialChars)
```
** replaces non-printable or otherwise confusing characters with a placeholder widget.

**
```
[scrollPastEnd](https://codemirror.net/docs/ref/#view.scrollPastEnd)
```
** allows the user to scroll down until the last line is at the top of the viewport.

**
```
[bracketMatching](https://codemirror.net/docs/ref/#language.bracketMatching)
```
** highlights the bracket that matches the one the cursor is currently on (if any).

**
```
[highlightSelectionMatches](https://codemirror.net/docs/ref/#search.highlightSelectionMatches)
```
** highlights instances of the currently selected text.

**
```
[placeholder](https://codemirror.net/docs/ref/#view.placeholder)
```
** displays a placeholder text when the editor is empty.

**
```
[phrases](https://codemirror.net/docs/ref/#state.EditorState^phrases)
```
** allows you to [translate](https://codemirror.net/examples/translate/) the text used in the editor interface.

### Gutters

**
```
[lineNumbers](https://codemirror.net/docs/ref/#view.lineNumbers)
```
** adds a line number gutter to the side of the editor.

**
```
[foldGutter](https://codemirror.net/docs/ref/#language.foldGutter)
```
** provides a gutter that shows which lines can be folded and whether they currently are folded.

**
```
[lintGutter](https://codemirror.net/docs/ref/#lint.lintGutter)
```
** lists [lint](https://codemirror.net/docs/ref/#lint) errors beside the lines in which they occur.

**
```
[gutters](https://codemirror.net/docs/ref/#view.gutters)
```
** can be used to configure the behavior of the gutters.

**
```
[highlightActiveLineGutter](https://codemirror.net/docs/ref/#view.highlightActiveLineGutter)
```
** adds a style to the gutters alongside the line with the cursor on it.

**
```
[gutter](https://codemirror.net/docs/ref/#view.gutter)
```
** is a primitive for defining custom editor gutters.

### Tooltips

**
```
[tooltips](https://codemirror.net/docs/ref/#view.tooltips)
```
** configures the behavior of editor tooltips (such as autocompletion prompts).

**
```
[hoverTooltip](https://codemirror.net/docs/ref/#view.hoverTooltip)
```
** can be used to display a tooltip when the pointer hovers over some parts of the content.

## Input Handling

**
```
[domEventHandlers](https://codemirror.net/docs/ref/#view.EditorView^domEventHandlers)
```
** provides handlers for raw browser events.

**
```
[dropCursor](https://codemirror.net/docs/ref/#view.dropCursor)
```
** shows a pseudo-cursor at the current drop point when the user drags content over the editor.

**
```
[keymap](https://codemirror.net/docs/ref/#view.keymap)
```
** is the facet used to add keymaps to the editor. The core libraries define a number of keymaps: **
```
[standardKeymap](https://codemirror.net/docs/ref/#commands.standardKeymap)
```
**, **
```
[defaultKeymap](https://codemirror.net/docs/ref/#commands.defaultKeymap)
```
**, **
```
[foldKeymap](https://codemirror.net/docs/ref/#language.foldKeymap)
```
**, **
```
[historyKeymap](https://codemirror.net/docs/ref/#commands.historyKeymap)
```
**, **
```
[searchKeymap](https://codemirror.net/docs/ref/#search.searchKeymap)
```
**, **
```
[completionKeymap](https://codemirror.net/docs/ref/#autocomplete.completionKeymap)
```
**, **
```
[closeBracketsKeymap](https://codemirror.net/docs/ref/#autocomplete.closeBracketsKeymap)
```
**, **
```
[lintKeymap](https://codemirror.net/docs/ref/#lint.lintKeymap)
```
**.

**
```
[inputHandler](https://codemirror.net/docs/ref/#view.EditorView^inputHandler)
```
** allows a function to intercept and handle user text input.

**
```
[mouseSelectionStyle](https://codemirror.net/docs/ref/#view.EditorView^mouseSelectionStyle)
```
** provides a hook to implement custom handling for some types of mouse selection.

**
```
[dragMovesSelection](https://codemirror.net/docs/ref/#view.EditorView^dragMovesSelection)
```
** determines when dragging text in the editor moves (versus copies) it.

**
```
[clickAddsSelectionRange](https://codemirror.net/docs/ref/#view.EditorView^clickAddsSelectionRange)
```
** configures which kind of clicks add a new selection range.

**
```
[rectangularSelection](https://codemirror.net/docs/ref/#view.rectangularSelection)
```
** makes pointer selection with Alt held down select a rectangular region.

**
```
[crosshairCursor](https://codemirror.net/docs/ref/#view.crosshairCursor)
```
** displays the pointer as a cross when Alt is held.

## Language

Language-related extensions are usually imported from language-specific packages. For example, [@codemirror/lang-javascript](https://github.com/codemirror/lang-javascript) exports 
```
javascript()
```
, which can be added to a configuration to get JavaScript highlighting and completion.

**
```
[Language](https://codemirror.net/docs/ref/#language.Language)
```
** objects are added to a configuration to select the language to use.

**
```
[Language.data](https://codemirror.net/docs/ref/#language.Language.data)
```
** can be used to register [language-specific data](https://codemirror.net/docs/ref/#state.EditorState.languageDataAt) (such as an [autocompletion source](https://codemirror.net/examples/autocompletion/)).

**
```
[syntaxHighlighting](https://codemirror.net/docs/ref/#language.syntaxHighlighting)
```
** enables a given code highlighting style.

**
```
[foldService](https://codemirror.net/docs/ref/#language.foldService)
```
** defines a source of code folding information. Usually best specified [through](https://codemirror.net/docs/ref/#language.foldNodeProp) the syntax tree.

**
```
[indentService](https://codemirror.net/docs/ref/#language.indentService)
```
** defines a source of autoindentation. Again, best [provided](https://codemirror.net/docs/ref/#language.indentNodeProp) via the syntax tree.

**
```
[linter](https://codemirror.net/docs/ref/#lint.linter)
```
** can be used to register a linter, and show the diagnostics it produces in the editor (see also **
```
[lintGutter](https://codemirror.net/docs/ref/#lint.lintGutter)
```
**).

## Primitives

**
```
[StateField](https://codemirror.net/docs/ref/#view.StateField)
```
**s are added to the editor by including them in its set of extensions.

**
```
[ViewPlugin](https://codemirror.net/docs/ref/#view.ViewPlugin)
```
** instances can be used as extensions, registering their plugin.

**
```
[exceptionSink](https://codemirror.net/docs/ref/#view.EditorView^exceptionSink)
```
** is used to route exceptions caught by the editor to your code.

**
```
[updateListener](https://codemirror.net/docs/ref/#view.EditorView^updateListener)
```
** registers a function that will be called for every update to the editor.

### Transactions

The following facets can be used to inspect and alter [transactions](https://codemirror.net/docs/ref/#state.Transaction) before they take effect.

**
```
[changeFilter](https://codemirror.net/docs/ref/#state.EditorState^changeFilter)
```
** filters or suppresses document changes.

**
```
[transactionFilter](https://codemirror.net/docs/ref/#state.EditorState^transactionFilter)
```
** can modify, extend, or cancel entire transaction.

**
```
[transactionExtender](https://codemirror.net/docs/ref/#state.EditorState^transactionExtender)
```
** adds extra metadata or effects to transactions.

## Extension Bundles

**
```
[basicSetup](https://codemirror.net/docs/ref/#codemirror.basicSetup)
```
** is an array of extensions that enables many of the features listed on this page.

**
```
[minimalSetup](https://codemirror.net/docs/ref/#codemirror.minimalSetup)
```
** is a much more minimal collection of extensions, containing just the ones that are recommended for every editor.