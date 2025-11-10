/**
 * Main App Component
 * 
 * Root component for the Cadence lyric editor application.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { LyricEditor } from './components/LyricEditor';
import { ErrorDisplay } from './components/ErrorDisplay';
import { ErrorBoundary } from './components/ErrorBoundary';
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
  const [editorKey, setEditorKey] = useState(0); // Key to force re-mount for clear
  const [syllableData, setSyllableData] = useState<Map<number, SyllableData>>(new Map());
  const [syllablesVisible, setSyllablesVisible] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage or default to dark
    return localStorage.theme === 'dark' || !localStorage.theme;
  });

  // Initialize dark mode on mount and listen for theme changes
  useEffect(() => {
    // Set dark mode as default if not set
    if (!localStorage.theme) {
      localStorage.theme = 'dark';
      document.documentElement.classList.add('dark');
    }

    // Listen for theme changes (from ThemeToggle component)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const hasDarkClass = document.documentElement.classList.contains('dark');
          setIsDarkMode(hasDarkClass);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
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
      // Force re-mount with empty content by changing key
      setEditorKey(prev => prev + 1);
      setSyllableData(new Map());
    }
  }, []);

  const handleExport = useCallback(() => {
    // Since we don't track content in state anymore, we need to get it from the editor
    // For now, we'll disable export until we implement a ref-based approach
    console.warn('Export is temporarily disabled during refactor');
    alert('Export feature will be re-enabled in the next update');
  }, []);

  const handleToggleSyllables = useCallback(() => {
    setSyllablesVisible(prev => !prev);
  }, []);

  const handleFontSizeChange = useCallback((size: number) => {
    setFontSize(size);
  }, []);

  // Calculate statistics from syllable data only
  const statistics = useMemo(() => {
    let totalWords = 0;
    let totalSyllables = 0;
    const lineCount = syllableData.size;

    syllableData.forEach(data => {
      totalWords += data.words.length;
      totalSyllables += data.totalSyllables;
    });

    return {
      lineCount,
      wordCount: totalWords,
      syllableCount: totalSyllables,
      averageSyllablesPerLine: lineCount > 0 ? totalSyllables / lineCount : 0,
    };
  }, [syllableData]);

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-[hsl(var(--color-background))]">
        {/* Header - Slimmer and more modern */}
        <header className="bg-white dark:bg-[hsl(220,18%,10%)] border-b border-gray-200 dark:border-[hsl(220,15%,18%)]">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
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

        {/* Main Editor - Simplified and correct layout */}
        <main className="flex-1 flex flex-col overflow-hidden items-center">
          <div className="flex flex-col w-full max-w-7xl h-full">
            <Toolbar
              onClear={handleClear}
              onExport={handleExport}
              onToggleSyllables={handleToggleSyllables}
              syllablesVisible={syllablesVisible}
              onFontSizeChange={handleFontSizeChange}
              fontSize={fontSize}
            />
            {/* Centered container with max-width for better readability on wide screens */}
            <div className="flex-1 flex flex-col overflow-hidden p-4">
              {/* Error Display within main content area */}
              {errors.length > 0 && (
                <ErrorDisplay
                  errors={errors}
                  onDismiss={handleDismissErrors}
                  className="mb-4"
                />
              )}
              {/* Editor container */}
              <div className="flex-1 relative overflow-hidden">
                <LyricEditor
                  key={editorKey}
                  initialValue={INITIAL_CONTENT}
                  onSyllableUpdate={handleSyllableUpdate}
                  syllablesVisible={syllablesVisible}
                  fontSize={fontSize}
                  isDarkMode={isDarkMode}
                  className="absolute inset-0"
                />
              </div>
            </div>
            <StatisticsPanel
              lineCount={statistics.lineCount}
              wordCount={statistics.wordCount}
              syllableCount={statistics.syllableCount}
              averageSyllablesPerLine={statistics.averageSyllablesPerLine}
            />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
