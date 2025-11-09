/**
 * Toolbar Component
 * 
 * Provides quick actions for common editor operations.
 */

import { useState } from 'react';

interface ToolbarProps {
  onClear: () => void;
  onExport: (format: 'txt' | 'html') => void;
  onToggleSyllables: () => void;
  syllablesVisible: boolean;
  onFontSizeChange: (size: number) => void;
  fontSize: number;
  className?: string;
}

export function Toolbar({
  onClear,
  onExport,
  onToggleSyllables,
  syllablesVisible,
  onFontSizeChange,
  fontSize,
  className = '',
}: ToolbarProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = (format: 'txt' | 'html') => {
    onExport(format);
    setShowExportMenu(false);
  };

  return (
    <div className={`toolbar flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Clear button */}
      <button
        onClick={onClear}
        className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        title="Clear all text (Ctrl+K)"
      >
        Clear
      </button>

      {/* Export dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          title="Export lyrics"
        >
          Export ▾
        </button>
        
        {showExportMenu && (
          <div className="absolute left-0 mt-1 w-32 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-10">
            <button
              onClick={() => handleExport('txt')}
              className="w-full px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              As Text (.txt)
            </button>
            <button
              onClick={() => handleExport('html')}
              className="w-full px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              As HTML (.html)
            </button>
          </div>
        )}
      </div>

      {/* Toggle syllables */}
      <button
        onClick={onToggleSyllables}
        className={`px-3 py-1.5 text-sm font-medium border rounded transition-colors ${
          syllablesVisible
            ? 'text-white bg-teal-600 border-teal-600 hover:bg-teal-700'
            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
        }`}
        title="Toggle syllable markers"
      >
        {syllablesVisible ? '✓ ' : ''}Syllables
      </button>

      {/* Font size controls */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs text-gray-600 dark:text-gray-400">Font:</span>
        <button
          onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
          className="w-8 h-8 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          title="Decrease font size"
          disabled={fontSize <= 12}
        >
          −
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8 text-center">
          {fontSize}
        </span>
        <button
          onClick={() => onFontSizeChange(Math.min(24, fontSize + 2))}
          className="w-8 h-8 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          title="Increase font size"
          disabled={fontSize >= 24}
        >
          +
        </button>
      </div>
    </div>
  );
}
