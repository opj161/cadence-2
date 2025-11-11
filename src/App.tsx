/**
 * Main App Component
 * 
 * Root component for the Cadence lyric editor application.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
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
  // Use ref to track syllable data without triggering re-renders
  const syllableDataRef = useRef<Map<number, SyllableData>>(new Map());
  const [syllablesVisible, setSyllablesVisible] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  // Maintain running statistics for better performance
  const [statistics, setStatistics] = useState({
    lineCount: 0,
    wordCount: 0,
    syllableCount: 0,
    averageSyllablesPerLine: 0,
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage or default to dark
    return localStorage.theme === 'dark' || !localStorage.theme;
  });

  // Initialize dark mode on mount and listen for theme changes via custom event
  useEffect(() => {
    // Set dark mode as default if not set
    if (!localStorage.theme) {
      localStorage.theme = 'dark';
      document.documentElement.classList.add('dark');
    }

    // Listen for theme changes via custom event (more efficient than MutationObserver)
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isDark: boolean }>;
      setIsDarkMode(customEvent.detail.isDark);
    };

    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const handleSyllableUpdate = useCallback((lineNumber: number, data: SyllableData) => {
    // Update syllable data map and statistics incrementally
    const syllableData = syllableDataRef.current;
    const oldData = syllableData.get(lineNumber);
    syllableData.set(lineNumber, data);
    
    // Update statistics incrementally
    setStatistics(stats => {
      const lineCount = syllableData.size;
      // Calculate delta for words and syllables
      const oldWords = oldData?.words.length || 0;
      const oldSyllables = oldData?.totalSyllables || 0;
      const newWords = data.words.length;
      const newSyllables = data.totalSyllables;
      
      const wordCount = stats.wordCount - oldWords + newWords;
      const syllableCount = stats.syllableCount - oldSyllables + newSyllables;
      
      return {
        lineCount,
        wordCount,
        syllableCount,
        averageSyllablesPerLine: lineCount > 0 ? syllableCount / lineCount : 0,
      };
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
      syllableDataRef.current = new Map();
      // Reset statistics
      setStatistics({
        lineCount: 0,
        wordCount: 0,
        syllableCount: 0,
        averageSyllablesPerLine: 0,
      });
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
