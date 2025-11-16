/**
 * Centralized logging utility for the application
 * Replaces direct console usage to improve maintainability and SonarQube metrics
 */

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private readonly isDevelopment: boolean;

  constructor() {
    // Check environment - compatible with both Vite and Jest
    this.isDevelopment = this.checkDevelopmentMode();
    
    // In production, only log warnings and errors
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

  private checkDevelopmentMode(): boolean {
    // For Jest/Node environment
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
    }
    
    // Default to development for browser environments (will be set correctly by build)
    return true;
  }

  /**
   * Log debug information (only in development)
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.DEBUG) {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log informational messages
   */
  info(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.INFO) {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log warnings
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.WARN) {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  /**
   * Log errors
   */
  error(message: string, error?: unknown, ...args: unknown[]): void {
    if (this.level <= LogLevel.ERROR) {
      // eslint-disable-next-line no-console
      console.error(`[ERROR] ${message}`, error, ...args);
    }
  }

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get the current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }
}

// Export singleton instance
export const logger = new Logger();
export { LogLevel };

