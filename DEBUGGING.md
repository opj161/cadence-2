# Cadence Debugging Guide

## Quick Console Log Reference

### Expected Console Output (Successful Flow)

When you type "beautiful day" into the editor, you should see:

```
[WorkerManager] Initializing Web Worker...
[WorkerManager] Worker created successfully
[LyricEditor] Processing line: { lineNumber: 0, text: "beautiful day", textLength: 13 }
[WorkerManager] Sending request: { id: 0, lineNumber: 0, textLength: 13 }
[Worker] Received request: { id: 0, type: "process-line", lineNumber: 0, textLength: 13 }
[Worker] Processed line: { id: 0, lineNumber: 0, totalSyllables: 4, wordCount: 2 }
[WorkerManager] Received response: { id: 0, type: "line-result", hasData: true, hasError: false }
[LyricEditor] Received syllable data: { lineNumber: 0, totalSyllables: 4, wordCount: 2 }
[LyricEditor] Dispatched syllable update to editor
```

---

## Troubleshooting Guide

### Issue: No console logs at all
**Diagnosis**: Worker not being created  
**Check**: 
- Browser DevTools → Console → Look for `[WorkerManager] Initializing Web Worker...`
- If missing, check if LyricEditor component is mounted
- Check for JavaScript errors in console

**Fix**:
- Verify `src/utils/workerManager.ts` is imported correctly
- Check `getWorkerManager()` singleton is being called

---

### Issue: Worker logs but no response
**Diagnosis**: Worker processing or communication error  
**Check**:
- See `[Worker] Received request` but no `[Worker] Processed line`
- Look for JavaScript errors in worker

**Fix**:
- Check if `hyphen/en` package is installed: `npm list hyphen`
- Verify worker file path in `workerManager.ts`: `../workers/syllableProcessor.worker.ts`
- Check for import errors in worker file

---

### Issue: Response received but no visual update
**Diagnosis**: Extension rendering issue  
**Check**:
- See `[LyricEditor] Dispatched syllable update` but no gutter/decorations appear
- Check if extensions are registered in LyricEditor

**Fix**:
- Verify extensions array in `LyricEditor.tsx`:
  ```typescript
  const extensions: Extension[] = [
    syllableStateField,      // MUST be first
    syllableGutter,
    syllableDecorationsField,
    smartFormatting,
    pasteHandler,
  ];
  ```

---

### Issue: Gutter shows numbers but wrong format
**Diagnosis**: Gutter rendering but not using brackets  
**Check**:
- Gutter visible but shows "8" instead of "[8]"

**Fix**:
- Verify `syllableGutter.ts` line 86:
  ```typescript
  dom.textContent = `[${this.count}]`;
  ```

---

### Issue: No syllable breaks within words
**Diagnosis**: Decoration not rendering or wrong approach  
**Check**:
- Gutter works but text looks like "beautiful" not "beau·ti·ful"
- Check console for decoration errors

**Fix**:
- Verify `syllableDecorations.ts` uses `Decoration.replace()` not `Decoration.widget()`
- Verify `HyphenatedWordWidget` class exists and has correct `toDOM()` method
- Check if `wordData.hyphenated` contains middle dots (·)

---

### Issue: Active line not highlighting
**Diagnosis**: CSS styling missing or overridden  
**Check**:
- Click on different lines, no background change
- Check DevTools → Elements → Inspect line, look for `.cm-activeLine` class

**Fix**:
- Verify `index.css` has `.cm-activeLine` styles
- Check if other CSS is overriding with `!important`
- Ensure basicSetup includes `highlightActiveLine`

---

## Manual Testing Steps

### Test 1: Basic Syllable Counting
1. Open http://localhost:5173
2. Type: "beautiful"
3. **Expected**:
   - Gutter shows `[3]`
   - Text shows "beau·ti·ful"
   - Console shows full log chain

### Test 2: Multi-Word Line
1. Clear editor
2. Type: "wonderful beautiful amazing"
3. **Expected**:
   - Gutter shows `[9]` (3 + 3 + 3)
   - Text shows "won·der·ful beau·ti·ful a·maz·ing"

### Test 3: Multiple Lines
1. Clear editor
2. Type:
   ```
   beautiful day
   wonderful world
   amazing grace
   ```
3. **Expected**:
   - Line 1: `[4]` → "beau·ti·ful day"
   - Line 2: `[4]` → "won·der·ful world"
   - Line 3: `[5]` → "a·maz·ing grace"

### Test 4: Real-Time Updates
1. Type slowly: "b... e... a... u... t... i... f... u... l"
2. **Expected**:
   - Updates should happen smoothly
   - Final count appears after 300ms pause

### Test 5: Active Line
1. Type multiple lines
2. Click between different lines
3. **Expected**:
   - Active line has subtle background highlight
   - Highlight changes when clicking different lines

### Test 6: Section Headers
1. Type: "### VERSE"
2. **Expected**:
   - Bold text, colored background
   - Blue border on left

---

## Browser DevTools Tips

### Console Filters
- Filter by `[Worker]` - See only worker logs
- Filter by `[WorkerManager]` - See only manager logs
- Filter by `[LyricEditor]` - See only editor logs

### Network Tab
- Check if worker file is loading: Look for `syllableProcessor.worker.ts`
- Should see status 200 and type "js"

### Elements Tab
- Inspect gutter: Look for `.cm-syllable-gutter` and `.syllable-count`
- Inspect words: Look for `.hyphenated-word` spans
- Inspect active line: Look for `.cm-activeLine` class

### Performance Tab
- Record typing session
- Check if worker processing is blocking main thread (should NOT be)
- Verify 300ms debounce is working

---

## Common Error Messages

### "Failed to load module script"
**Meaning**: Worker file not found or wrong path  
**Fix**: Check worker path in `workerManager.ts`

### "Cannot read property 'split' of undefined"
**Meaning**: `hyphenateSync` returned unexpected result  
**Fix**: Verify `hyphen/en` is installed and imported correctly

### "Cannot read property 'toDOM' of undefined"
**Meaning**: Widget class not instantiated correctly  
**Fix**: Check `HyphenatedWordWidget` constructor

### "RangeSet must be sorted"
**Meaning**: Decorations added in wrong order  
**Fix**: Verify decorations are sorted before adding to builder

---

## Performance Benchmarks

### Expected Performance
- Single word: < 5ms processing time
- Single line (10 words): < 20ms processing time
- 50 lines: < 1 second total processing time
- Debounce prevents excessive calls

### If Performance Issues
1. Check debounce is working (should be 300ms)
2. Verify worker is running (not blocking main thread)
3. Consider increasing debounce to 500ms
4. Add line-level caching in worker

---

## Emergency Rollback

If all else fails, check git history:
```powershell
git log --oneline
git diff HEAD~1
```

Last working state should have:
- Dark mode working
- UI layout working
- No TypeScript errors
