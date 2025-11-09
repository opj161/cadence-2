/**
 * Main App Component
 * 
 * Root component for the Cadence lyric editor application.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { LyricEditor } from './components/LyricEditor';
import { ErrorDisplay } from './components/ErrorDisplay';
import { Toolbar } from './components/Toolbar';
import { StatisticsPanel } from './components/StatisticsPanel';
import { ThemeToggle } from './components/ThemeToggle';
import type { SyllableData } from './types';

const INITIAL_CONTENT = `[Strophe 1]
Schreib hier deine Texte
Jede Zeile zeigt die Silbenanzahl

[Refrain]
Tippe ein paar Wörter
Beobachte den Silbenzähler
Sieh, wie die Markierungen erscheinen

# Dies ist ein Kommentar
# Kommentare beginnen mit #`;

function App() {
  const [errors, setErrors] = useState<string[]>([]);
  const [editorContent, setEditorContent] = useState(INITIAL_CONTENT);
  const [syllableData, setSyllableData] = useState<Map<number, SyllableData>>(new Map());
  const [syllablesVisible, setSyllablesVisible] = useState(true);
  const [fontSize, setFontSize] = useState(16);

  // Initialize dark mode on mount (ThemeToggle will handle this now)
  useEffect(() => {
    // Set dark mode as default if not set
    if (!localStorage.theme) {
      localStorage.theme = 'dark';
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleSyllableUpdate = useCallback((lineNumber: number, data: SyllableData) => {
    // Update syllable data map
    setSyllableData(prev => {
      const next = new Map(prev);
      next.set(lineNumber, data);
      return next;
    });

    // Collect any errors from processing
    if (data.errors && data.errors.length > 0) {
      setErrors(prev => {
        const newErrors = [...prev, ...data.errors!];
        // Keep only the last 10 errors to avoid memory issues
        return newErrors.slice(-10);
      });
    }
  }, []);

  const handleDismissErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const handleClear = useCallback(() => {
    if (confirm('Clear all text?')) {
      setEditorContent('');
      setSyllableData(new Map());
    }
  }, []);

  const handleExport = useCallback((format: 'txt' | 'html') => {
    const content = editorContent;
    const blob = format === 'txt' 
      ? new Blob([content], { type: 'text/plain' })
      : new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Cadence Export</title></head><body><pre>${content}</pre></body></html>`], { type: 'text/html' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lyrics.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [editorContent]);

  const handleToggleSyllables = useCallback(() => {
    setSyllablesVisible(prev => !prev);
  }, []);

  const handleFontSizeChange = useCallback((size: number) => {
    setFontSize(size);
  }, []);

  const handleEditorChange = useCallback((value: string) => {
    setEditorContent(value);
  }, []);

  // Calculate statistics
  const statistics = useMemo(() => {
    const lines = editorContent.split('\n').filter(line => line.trim().length > 0);
    let totalWords = 0;
    let totalSyllables = 0;

    syllableData.forEach(data => {
      totalWords += data.words.length;
      totalSyllables += data.totalSyllables;
    });

    return {
      lineCount: lines.length,
      wordCount: totalWords,
      syllableCount: totalSyllables,
      averageSyllablesPerLine: lines.length > 0 ? totalSyllables / lines.length : 0,
    };
  }, [editorContent, syllableData]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-[hsl(var(--color-background))]">
      {/* Header - Slimmer and more modern */}
      <header className="bg-white dark:bg-[hsl(220,18%,10%)] border-b border-gray-200 dark:border-[hsl(220,15%,18%)]">
        <div className="max-w-full mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
              Cadence
            </h1>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
              Beta
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="px-6 py-2">
          <ErrorDisplay
            errors={errors}
            onDismiss={handleDismissErrors}
          />
        </div>
      )}

      {/* Main Editor - Full width, no unnecessary padding */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-hidden flex flex-col">
            <Toolbar
              onClear={handleClear}
              onExport={handleExport}
              onToggleSyllables={handleToggleSyllables}
              syllablesVisible={syllablesVisible}
              onFontSizeChange={handleFontSizeChange}
              fontSize={fontSize}
            />
            <div className="flex-1 overflow-hidden">
              <LyricEditor
                value={editorContent}
                onSyllableUpdate={handleSyllableUpdate}
                onChange={handleEditorChange}
                syllablesVisible={syllablesVisible}
                fontSize={fontSize}
                className="h-full"
              />
            </div>
            <StatisticsPanel
              lineCount={statistics.lineCount}
              wordCount={statistics.wordCount}
              syllableCount={statistics.syllableCount}
              averageSyllablesPerLine={statistics.averageSyllablesPerLine}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
