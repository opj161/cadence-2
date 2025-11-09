/**
 * ErrorDisplay Component
 * 
 * Displays error messages from syllable processing in a dismissible banner.
 */

import type { ErrorDisplayProps } from '../types';

export function ErrorDisplay({
  errors,
  onDismiss,
  className = '',
}: ErrorDisplayProps) {
  if (errors.length === 0) return null;

  return (
    <div className={`error-display bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative ${className}`} role="alert">
      <strong className="font-bold">Processing Warnings:</strong>
      <div className="mt-2">
        <ul className="list-disc list-inside">
          {errors.map((error, index) => (
            <li key={index} className="text-sm">
              {error}
            </li>
          ))}
        </ul>
      </div>
      {onDismiss && (
        <button
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
          onClick={onDismiss}
          aria-label="Dismiss errors"
        >
          <svg
            className="fill-current h-6 w-6 text-red-500 dark:text-red-400"
            role="button"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <title>Close</title>
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
          </svg>
        </button>
      )}
    </div>
  );
}
