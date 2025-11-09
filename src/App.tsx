/**
 * Main App Component
 * 
 * Root component for the Cadence lyric editor application.
 */

import { useState, useCallback, useEffect } from 'react';
import { LyricEditor } from './components/LyricEditor';
import { ErrorDisplay } from './components/ErrorDisplay';
import type { SyllableData } from './types';

const INITIAL_CONTENT = `[Verse 1]
Write your lyrics here
Each line will show syllable counts

[Chorus]
Try typing some words
Watch the syllable counter
See the markers appear

# This is a comment
# Comments start with #`;

function App() {
  const [errors, setErrors] = useState<string[]>([]);

  // Initialize dark mode on mount
  useEffect(() => {
    // Set dark mode as default
    if (!localStorage.theme) {
      localStorage.theme = 'dark';
    }
    
    // Apply dark class to document
    if (localStorage.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleSyllableUpdate = useCallback((_lineNumber: number, data: SyllableData) => {
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

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Cadence
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time Lyric Syllable Analyzer
          </p>
        </div>
      </header>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <ErrorDisplay
            errors={errors}
            onDismiss={handleDismissErrors}
          />
        </div>
      )}

      {/* Main Editor */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <LyricEditor
              initialValue={INITIAL_CONTENT}
              onSyllableUpdate={handleSyllableUpdate}
              className="h-full"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Built with CodeMirror 6, React, and Vite
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
