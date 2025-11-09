# CodeMirror Decoration Example

## Example: Decorations

The DOM structure inside a CodeMirror editor is managed by the editor itself. Inside the 
```
cm-content
```
 element, any attempt to add attributes or change the structure of nodes will usually just lead to the editor immediately resetting the content back to what it used to be.

So to style content, replace content, or add additional elements in between the content, we have to tell the editor to do so. That is what [decorations](https://codemirror.net/docs/ref/#view.Decoration) are for.

## Types of Decorations

There are four different types of decorations that you can add to your content.

-   [Mark decorations](https://codemirror.net/docs/ref/#view.Decoration%5Emark) are the most common. These add some attributes or wrapping DOM element to pieces of content. Syntax highlighting, for example, is done with mark decorations.
    
-   [Widget decorations](https://codemirror.net/docs/ref/#view.Decoration%5Ewidget) insert a DOM element in the editor content. You could use this to, for example, add a color picker widget next to a color code. Widgets can be inline elements or [blocks](https://codemirror.net/docs/ref/#view.Decoration%5Ewidget%5Espec.block).
    
-   [Replacing decorations](https://codemirror.net/docs/ref/#view.Decoration%5Ereplace) _hide_ a stretch of content. This is useful for code folding or replacing an element in the text with something else. It is possible to display a [widget](https://codemirror.net/docs/ref/#view.Decoration%5Ereplace%5Espec.widget) instead of the replaced text.
    
-   [Line decorations](https://codemirror.net/docs/ref/#view.Decoration%5Eline), when positioned at the start of a line, can influence the attributes of the DOM element that wraps the line.

Calling these functions gives you a 
```
Decoration
```
 object, which just describes the type of decoration and which you can often reuse between instances of decorations. The [
```
range
```
](https://codemirror.net/docs/ref/#state.RangeValue.range) method on these objects gives you an actual decorated range, which holds both the type and a pair of 
```
from
```
/
```
to
```
 document offsets.

## Decoration Sources

Decorations are provided to the editor using the [
```
RangeSet
```
](https://codemirror.net/docs/ref/#state.RangeSet) data structure, which stores a collection of values (in this case the decorations) with ranges (start and end positions) associated with them. This data structure helps with things like efficiently updating the positions in a big set of decorations when the document changes.

Decorations are provided to the editor view through a [facet](https://codemirror.net/docs/ref/#view.EditorView%5Edecorations). There are two ways to provide them—directly, or though a function that will be called with a view instance to produce a set of decorations. Decorations that signficantly change the vertical layout of the editor, for example by replacing line breaks or inserting block widgets, must be provided directly, since indirect decorations are only retrieved after the viewport has been computed.

Indirect decorations are appropriate for things like syntax highlighting or search match highlighting, where you might want to just render the decorations inside the [viewport](https://codemirror.net/docs/ref/#view.EditorView.viewport) or the current [visible ranges](https://codemirror.net/docs/ref/#view.EditorView.visibleRanges), which can help a lot with performance.

Let's start with an example that keeps decorations in the state, and provides them directly.

## Underlining Command

Say we want to implement an editor extension that allows the user to underline parts of the document. To do this, we could define a [state field](https://codemirror.net/docs/ref/#state.StateField) that tracks which parts of the document are underlined, and provides [mark decoration](https://codemirror.net/docs/ref/#view.Decoration%5Emark) that draw those underlines.

To keep the code simple, the field stores only the decoration range set. It doesn't do things like joining overlapping underlines, but just dumps any newly underlined region into its set of ranges.

```
import {EditorView, Decoration, DecorationSet} from "@codemirror/view"
import {StateField, StateEffect} from "@codemirror/state"

const addUnderline = StateEffect.define<{from: number, to: number}>({
  map: ({from, to}, change) => ({from: change.mapPos(from), to: change.mapPos(to)})
})

const underlineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(underlines, tr) {
    underlines = underlines.map(tr.changes)
    for (let e of tr.effects) if (e.is(addUnderline)) {
      underlines = underlines.update({
        add: [underlineMark.range(e.value.from, e.value.to)]
      })
    }
    return underlines
  },
  provide: f => EditorView.decorations.from(f)
})

const underlineMark = Decoration.mark({class: "cm-underline"})

```

Note that the 
```
update
```
 method starts by [mapping](https://codemirror.net/docs/ref/#state.RangeSet.map) its ranges through the transaction's changes. The old set refers to positions in the old document, and the new state must get a set with positions in the new document, so unless you completely recompute your decoration set, you'll generally want to map it though document changes.

Then it checks if the [effect](https://codemirror.net/docs/ref/#state.StateEffect) we defined for adding underlines is present in the transaction, and if so, extends the decoration set with more ranges.

Next we define a command that, if any text is selected, adds an underline to it. We'll just make it automatically enable the state field (and a [base theme](https://codemirror.net/docs/ref/#view.EditorView%5EbaseTheme)) on demand, so that no further configuration is necessary.

```
const underlineTheme = EditorView.baseTheme({
  ".cm-underline": { textDecoration: "underline 3px red" }
})

export function underlineSelection(view: EditorView) {
  let effects: StateEffect<unknown>[] = view.state.selection.ranges
    .filter(r => !r.empty)
    .map(({from, to}) => addUnderline.of({from, to}))
  if (!effects.length) return false

  if (!view.state.field(underlineField, false))
    effects.push(StateEffect.appendConfig.of([underlineField,
                                              underlineTheme]))
  view.dispatch({effects})
  return true
}

```

And finally, this keymap binds that command to Ctrl-h (Cmd-h on macOS). The 
```
preventDefault
```
 field is there because even when the command doesn't apply, we don't want the browser's default behavior to happen.

```
import {keymap} from "@codemirror/view"

export const underlineKeymap = keymap.of([{
  key: "Mod-h",
  preventDefault: true,
  run: underlineSelection
}])

```

Next, we'll look at a plugin that displays a checkbox widget next to boolean literals, and allows the user to click that to flip the literal.

Widget decorations don't directly contain their widget DOM. Apart from helping keep mutable objects out of the editor state, this additional level of indirection also makes it possible to recreate widgets without redrawing the DOM for them. We'll use that later by simply recreating our decoration set whenever the document changes.

Thus, we must first define a subclass of [
```
WidgetType
```
](https://codemirror.net/docs/ref/#view.WidgetType) that draws the widget.

```
import {WidgetType} from "@codemirror/view"

class CheckboxWidget extends WidgetType {
  constructor(readonly checked: boolean) { super() }

  eq(other: CheckboxWidget) { return other.checked == this.checked }

  toDOM() {
    let wrap = document.createElement("span")
    wrap.setAttribute("aria-hidden", "true")
    wrap.className = "cm-boolean-toggle"
    let box = wrap.appendChild(document.createElement("input"))
    box.type = "checkbox"
    box.checked = this.checked
    return wrap
  }

  ignoreEvent() { return false }
}

```

Decorations contain instances of this class (which are cheap to create). When the view updates itself, if it finds it already has a drawn instance of such a widget in the position where the widget occurs (using the 
```
eq
```
 method to determine equivalence), it will simply reuse that.

It is also possible to optimize updating of DOM structure for widgets of the same type but with different content by defining an [
```
updateDOM
```
](https://codemirror.net/docs/ref/#view.WidgetType.updateDOM) method. But that doesn't help much here.

The produced DOM wraps the checkbox in a 
```
<span>
```
 element, mostly because Firefox handles checkboxes with 
```
contenteditable=false
```
 poorly (running into browser quirks is common around the edges of contenteditable). We'll also tell screen readers to ignore it since the feature doesn't really work without a pointing device anyway.

Finally, the widget's 
```
ignoreEvents
```
 method tells the editor to not ignore events that happen in the widget. This is necessary to allow an editor-wide event handler (defined later) to handle interaction with it.

Next, this function uses the editor's [syntax tree](https://codemirror.net/docs/ref/#language.syntaxTree) (assuming the JavaScript language is enabled) to locate boolean literals in the visible parts of the editor and create widgets for them.

```
import {EditorView, Decoration} from "@codemirror/view"
import {syntaxTree} from "@codemirror/language"

function checkboxes(view: EditorView) {
  let widgets = []
  for (let {from, to} of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from, to,
      enter: (node) => {
        if (node.name == "BooleanLiteral") {
          let isTrue = view.state.doc.sliceString(node.from, node.to) == "true"
          let deco = Decoration.widget({
            widget: new CheckboxWidget(isTrue),
            side: 1
          })
          widgets.push(deco.range(node.to))
        }
      }
    })
  }
  return Decoration.set(widgets)
}

```

That function is used by a [view plugin](https://codemirror.net/docs/ref/#view.ViewPlugin) that keeps an up-to-date decoration set as the document or viewport changes.

```
import {ViewUpdate, ViewPlugin, DecorationSet} from "@codemirror/view"

const checkboxPlugin = ViewPlugin.fromClass(class {
  decorations: DecorationSet

  constructor(view: EditorView) {
    this.decorations = checkboxes(view)
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged ||
        syntaxTree(update.startState) != syntaxTree(update.state))
      this.decorations = checkboxes(update.view)
  }
}, {
  decorations: v => v.decorations,

  eventHandlers: {
    mousedown: (e, view) => {
      let target = e.target as HTMLElement
      if (target.nodeName == "INPUT" &&
          target.parentElement!.classList.contains("cm-boolean-toggle"))
        return toggleBoolean(view, view.posAtDOM(target))
    }
  }
})

```

The options given to the plugin tell the editor that, firstly, it can [get](https://codemirror.net/docs/ref/#view.PluginSpec.decorations) decorations from this plugin, and secondly, that as long as the plugin is active, the given 
```
mousedown
```
 handler should be registered. The handler checks the event target to recognize clicks on checkboxes, and uses the following helper to actually toggle booleans.

```
function toggleBoolean(view: EditorView, pos: number) {
  let before = view.state.doc.sliceString(Math.max(0, pos - 5), pos)
  let change
  if (before == "false")
    change = {from: pos - 5, to: pos, insert: "true"}
  else if (before.endsWith("true"))
    change = {from: pos - 4, to: pos, insert: "false"}
  else
    return false
  view.dispatch({changes: change})
  return true
}

```

After adding the plugin as an extension to a (JavaScript) editor, you get something like this:

To see an example of line decorations, check out the [zebra stripe example](https://codemirror.net/examples/zebra/).

## Atomic Ranges

In some cases, such as with most replacing decorations larger than a single character, you want editing actions to treat the ranges as atomic elements, skipping over them during cursor motion, and backspacing them out in one step.

The [
```
EditorView.atomicRanges
```
](https://codemirror.net/docs/ref/#view.EditorView%5EatomicRanges) facet can be provided range sets (usually the same set that we're using for the decorations) and will make sure cursor motion skips the ranges in that set.

Let's implement an extension that replaces placeholder names like 
```
[[this]]
```
 with widgets, and makes the editor treat them as atoms.

[
```
MatchDecorator
```
](https://codemirror.net/docs/ref/#view.MatchDecorator) is a helper class that can be used to quickly set up view plugins that decorate all matches of a given regular expression in the viewport.

```
import {MatchDecorator} from "@codemirror/view"

const placeholderMatcher = new MatchDecorator({
  regexp: /\[\[(\w+)\]\]/g,
  decoration: match => Decoration.replace({
    widget: new PlaceholderWidget(match[1]),
  })
})

```

(
```
PlaceholderWidget
```
 is a straightforward subclass of [
```
WidgetType
```
](https://codemirror.net/docs/ref/#view.WidgetType) that renders the given name in a styled element.)

We'll use the matcher to create and maintain the decorations in our plugin. It also [provides](https://codemirror.net/docs/ref/#view.PluginSpec.provide) the decoration set as atomic ranges.

```
import {Decoration, DecorationSet, EditorView,
        ViewPlugin, ViewUpdate} from "@codemirror/view"

const placeholders = ViewPlugin.fromClass(class {
  placeholders: DecorationSet
  constructor(view: EditorView) {
    this.placeholders = placeholderMatcher.createDeco(view)
  }
  update(update: ViewUpdate) {
    this.placeholders = placeholderMatcher.updateDeco(update, this.placeholders)
  }
}, {
  decorations: instance => instance.placeholders,
  provide: plugin => EditorView.atomicRanges.of(view => {
    return view.plugin(plugin)?.placeholders || Decoration.none
  })
})

```

It is possible to implement something like that in a custom way with [transaction filters](https://codemirror.net/docs/ref/#state.EditorState%5EtransactionFilter), if you need