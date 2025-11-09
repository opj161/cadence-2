/**
 * Toolbar Component
 * 
 * Provides quick actions for common editor operations with modern design.
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

  const buttonBase = "px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-md";
  const buttonDefault = "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-400 dark:hover:border-gray-600";
  const buttonActive = "text-white dark:text-white bg-cyan-500 dark:bg-cyan-600 border border-cyan-500 dark:border-cyan-600 hover:bg-cyan-600 dark:hover:bg-cyan-700 shadow-sm";

  return (
    <div className={`toolbar flex items-center gap-2 px-4 py-2.5 bg-white/50 dark:bg-[hsl(220,18%,10%)]/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 ${className}`}>
      {/* Clear button */}
      <button
        onClick={onClear}
        className={`${buttonBase} ${buttonDefault}`}
        title="Clear all text"
      >
        Clear
      </button>

      {/* Export dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          className={`${buttonBase} ${buttonDefault}`}
          title="Export lyrics"
        >
          Export ▾
        </button>
        
        {showExportMenu && (
          <div className="absolute left-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
            <button
              onClick={() => handleExport('txt')}
              className="w-full px-4 py-2.5 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Text File (.txt)
            </button>
            <button
              onClick={() => handleExport('html')}
              className="w-full px-4 py-2.5 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              HTML (.html)
            </button>
          </div>
        )}
      </div>

      {/* Toggle syllables */}
      <button
        onClick={onToggleSyllables}
        className={`${buttonBase} ${syllablesVisible ? buttonActive : buttonDefault}`}
        title="Toggle syllable markers"
      >
        {syllablesVisible && (
          <span className="mr-1.5">✓</span>
        )}
        Syllables
      </button>

      {/* Font size controls */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Size:</span>
        <button
          onClick={() => onFontSizeChange(Math.max(12, fontSize - 1))}
          className={`w-7 h-7 text-sm font-bold ${buttonBase} ${buttonDefault} disabled:opacity-40 disabled:cursor-not-allowed`}
          title="Decrease font size"
          disabled={fontSize <= 12}
        >
          −
        </button>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-8 text-center tabular-nums">
          {fontSize}
        </span>
        <button
          onClick={() => onFontSizeChange(Math.min(24, fontSize + 1))}
          className={`w-7 h-7 text-sm font-bold ${buttonBase} ${buttonDefault} disabled:opacity-40 disabled:cursor-not-allowed`}
          title="Increase font size"
          disabled={fontSize >= 24}
        >
          +
        </button>
      </div>
    </div>
  );
}
