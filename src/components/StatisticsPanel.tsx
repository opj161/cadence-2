/**
 * Statistics Panel Component
 * 
 * Displays document statistics with modern, clean design.
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
    <div className={`statistics-panel flex items-center justify-center gap-8 px-6 py-2.5 bg-white/50 dark:bg-[hsl(220,18%,10%)]/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 text-sm ${className}`}>
      <div className="stat-item flex items-baseline gap-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Lines</span>
        <span className="text-base font-bold text-gray-900 dark:text-gray-100 tabular-nums">{lineCount}</span>
      </div>
      
      <div className="stat-item flex items-baseline gap-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Words</span>
        <span className="text-base font-bold text-gray-900 dark:text-gray-100 tabular-nums">{wordCount}</span>
      </div>
      
      <div className="stat-item flex items-baseline gap-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Syllables</span>
        <span className="text-base font-bold text-cyan-500 dark:text-cyan-400 tabular-nums">{syllableCount}</span>
      </div>
      
      <div className="stat-item flex items-baseline gap-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg</span>
        <span className="text-base font-bold text-gray-900 dark:text-gray-100 tabular-nums">
          {averageSyllablesPerLine.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
