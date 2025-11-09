/**
 * Logging Utility
 * 
 * Provides environment-aware logging that only outputs in development mode.
 * In production builds, all logging is removed to improve performance.
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Log a debug message (only in development)
 */
export function logDebug(component: string, message: string, data?: unknown): void {
  if (isDevelopment) {
    console.log(`[${component}] ${message}`, data || '');
  }
}

/**
 * Log an error (always logged, even in production)
 */
export function logError(component: string, message: string, error?: unknown): void {
  console.error(`[${component}] ${message}`, error || '');
}

/**
 * Log a warning (always logged, even in production)
 */
export function logWarn(component: string, message: string, data?: unknown): void {
  console.warn(`[${component}] ${message}`, data || '');
}
