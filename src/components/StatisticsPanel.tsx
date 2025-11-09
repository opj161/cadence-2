/**
 * Statistics Panel Component
 * 
 * Displays document statistics (word count, syllable count, etc.)
 */

interface StatisticsPanelProps {
  wordCount: number;
  syllableCount: number;
  lineCount: number;
  averageSyllablesPerLine: number;
  className?: string;
}

export function StatisticsPanel({
  wordCount,
  syllableCount,
  lineCount,
  averageSyllablesPerLine,
  className = '',
}: StatisticsPanelProps) {
  return (
    <div className={`statistics-panel flex items-center gap-6 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-sm ${className}`}>
      <div className="stat-item">
        <span className="text-gray-500 dark:text-gray-400">Lines: </span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">{lineCount}</span>
      </div>
      
      <div className="stat-item">
        <span className="text-gray-500 dark:text-gray-400">Words: </span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">{wordCount}</span>
      </div>
      
      <div className="stat-item">
        <span className="text-gray-500 dark:text-gray-400">Syllables: </span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">{syllableCount}</span>
      </div>
      
      <div className="stat-item">
        <span className="text-gray-500 dark:text-gray-400">Avg/Line: </span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {averageSyllablesPerLine.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
