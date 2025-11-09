# Cadence Implementation Assessment & Fix Plan

**Date**: November 9, 2025

## Current Issues

### 1. Syllable Gutter Display ❌
**Problem**: Gutter should show `[8]`, `[10]` format but currently shows plain numbers (if showing at all).

**Root Cause**: 
- GutterMarker `toDOM()` method doesn't include brackets
- May not be rendering at all due to worker or state issues

**Fix**: Update `toDOM()` to wrap count in brackets.

---

### 2. In-Line Syllable Breaks ❌ CRITICAL
**Problem**: Should show "won·der·ful" within words, not bullets between them.

**Root Cause**: 
- Current implementation uses `Decoration.widget()` to insert bullet markers
- This creates separate DOM elements BETWEEN characters
- Cannot modify the actual text content with this approach

**Wrong Approach**:
```
"beautiful" → "beau • ti • ful" (separate elements)
```

**Correct Approach**:
```
"beautiful" → "beau·ti·ful" (replace word with hyphenated version)
```

**Fix Options**:
1. **Option A - Decoration.replace()**: Replace each word with a widget that renders hyphenated text
2. **Option B - Decoration.mark()**: Mark each syllable boundary and use CSS ::after to insert middle dots
3. **Option C - Mixed approach**: Use replace for the entire line with formatted HTML

**Chosen**: Option A - Replace individual words with hyphenated widgets

---

### 3. Active Line Highlighting ❓
**Problem**: Not clearly visible or not working.

**Status**: CodeMirror's `highlightActiveLine` is enabled in basicSetup, but styling may need enhancement.

**Fix**: Verify extension is active, enhance CSS if needed.

---

### 4. Web Worker Execution ❓
**Problem**: Unknown if syllable processing is actually running.

**Diagnostic Steps**:
1. Add console.log in worker onmessage
2. Add console.log in workerManager
3. Add console.log in LyricEditor processLine
4. Check browser console for errors

**Fix**: Add debugging, verify worker loads and processes messages.

---

## Implementation Plan

### Phase 1: Diagnostics & Gutter Fix (5 min)
1. ✅ Add console logging to worker, manager, and component
2. ✅ Fix gutter display to show `[N]` format
3. ✅ Test in browser, verify logs

### Phase 2: Syllable Display Rewrite (15 min)
1. ✅ Create new approach using `Decoration.replace()`
2. ✅ Create `HyphenatedWordWidget` that renders "word·by·word"
3. ✅ Update syllableDecorations to use replace instead of widget
4. ✅ Store hyphenated word data in SyllableData
5. ✅ Test rendering

### Phase 3: Active Line Enhancement (2 min)
1. ✅ Verify highlightActiveLine is active
2. ✅ Enhance CSS styling for better visibility

### Phase 4: Testing & Refinement (5 min)
1. ✅ Test all three core functions
2. ✅ Verify performance with longer text
3. ✅ Fix any remaining issues

---

## Technical Details

### Syllable Display Implementation

**Data Structure Update**:
```typescript
interface WordSyllables {
  word: string;              // Original: "beautiful"
  hyphenated: string;        // NEW: "beau·ti·ful"
  count: number;             // 3
  positions: number[];       // [4, 6]
  success: boolean;
}
```

**Worker Update**:
```typescript
function processWord(word: string): WordSyllables {
  const hyphenated = hyphenateSync(cleaned);
  const syllables = hyphenated.split('\u00AD');
  
  return {
    word,
    hyphenated: syllables.join('·'), // NEW: Join with middle dot
    count: syllables.length,
    positions,
    success: true,
  };
}
```

**Decoration Update**:
```typescript
class HyphenatedWordWidget extends WidgetType {
  constructor(private hyphenated: string) { super(); }
  
  toDOM() {
    const span = document.createElement('span');
    span.className = 'hyphenated-word';
    span.textContent = this.hyphenated; // "beau·ti·ful"
    return span;
  }
}

// Replace word with hyphenated version
const decoration = Decoration.replace({
  widget: new HyphenatedWordWidget(wordData.hyphenated),
});

decorations.push({ from: wordStart, to: wordEnd, decoration });
```

---

## Testing Checklist

- [ ] Gutter shows `[8]`, `[10]` format
- [ ] Words show as "won·der·ful" inline
- [ ] Active line is clearly highlighted
- [ ] Counts update as user types
- [ ] No performance issues
- [ ] Works with multi-line paste
- [ ] Section headers still formatted
- [ ] Dark mode styling correct

---

## Success Criteria

1. **Syllable Gutter**: Each line shows total count in `[N]` format
2. **Syllable Breaks**: Words display as "word·by·word" within the text
3. **Active Line**: Current line/paragraph clearly highlighted
4. **Real-time**: All updates happen as user types (300ms debounce)
5. **Performance**: No lag with 50+ lines of text
