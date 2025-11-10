/**
 * Debounce Utility
 * 
 * Creates a debounced function that delays invoking `func` until after `delay`
 * milliseconds have passed since the last time the debounced function was invoked.
 * The debounced function also has a `cancel` method to cancel delayed `func` invocations.
 * 
 * This is a standard pattern for rate-limiting expensive operations like API calls,
 * file processing, or UI updates.
 */

/**
 * Creates a debounced version of the provided function.
 * 
 * @param func - The function to debounce
 * @param delay - The number of milliseconds to delay
 * @returns A debounced function with a cancel method
 * 
 * @example
 * ```ts
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 300);
 * 
 * debouncedSearch('hello'); // Will execute after 300ms
 * debouncedSearch('world'); // Cancels previous, will execute after 300ms
 * debouncedSearch.cancel();  // Cancels the pending invocation
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<F extends (...args: any[]) => void>(
  func: F,
  delay: number
): ((...args: Parameters<F>) => void) & { cancel: () => void } {
  let timeoutId: number | null = null;

  const debouncedFunc = (...args: Parameters<F>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      timeoutId = null;
      func(...args);
    }, delay);
  };

  debouncedFunc.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFunc;
}
