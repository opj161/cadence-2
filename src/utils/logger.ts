/**
 * Centralized logging utility for the application.
 * Provides level-based logging that can be disabled in production.
 */

export const LogLevel = {
  ERROR: 0,   // For critical errors
  WARN: 1,    // For non-critical warnings
  INFO: 2,    // For important informational messages
  DEBUG: 3,   // For detailed debugging
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

// Set the application's log level based on the environment.
const APP_LOG_LEVEL = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN;

class Logger {
  private log(level: LogLevel, component: string, message: string, data?: unknown): void {
    if (level > APP_LOG_LEVEL) {
      return; // Don't log messages above the current level
    }

    const timestamp = new Date().toISOString();
    const levelStr = Object.keys(LogLevel).find(key => LogLevel[key as keyof typeof LogLevel] === level) || 'UNKNOWN';
    const formattedMessage = `[${timestamp}] [${levelStr}] [${component}] ${message}`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data || '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, data || '');
        break;
      case LogLevel.DEBUG:
        console.log(formattedMessage, data || '');
        break;
    }
  }

  error(component: string, message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, component, message, data);
  }

  warn(component: string, message: string, data?: unknown): void {
    this.log(LogLevel.WARN, component, message, data);
  }

  info(component: string, message: string, data?: unknown): void {
    this.log(LogLevel.INFO, component, message, data);
  }

  debug(component: string, message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, component, message, data);
  }
}

// Export a single, shared instance of the logger.
export const logger = new Logger();

// Export legacy function names for backward compatibility during migration
export const logDebug = logger.debug.bind(logger);
export const logError = logger.error.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logInfo = logger.info.bind(logger);

