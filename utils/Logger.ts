// utils/Logger.ts
class Logger {
  private static isDevelopment = __DEV__;
  private static isVerbose = false; // Set to true only for debugging

  static log(message: string, ...args: any[]) {
    if (this.isDevelopment && this.isVerbose) {
      console.log(message, ...args);
    }
  }

  static info(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.info('ℹ️', message, ...args);
    }
  }

  static warn(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.warn('⚠️', message, ...args);
    }
  }

  static error(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.error('❌', message, ...args);
    }
  }

  static success(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log('✅', message, ...args);
    }
  }

  static debug(message: string, ...args: any[]) {
    if (this.isDevelopment && this.isVerbose) {
      console.log('🐛', message, ...args);
    }
  }

  // Silent methods for production-critical operations
  static silentLog(message: string, ...args: any[]) {
    // Only log to crash reporting services in production
    // For now, completely silent
  }

  static silentError(message: string, ...args: any[]) {
    // Only send to error tracking in production
    // For now, completely silent
  }

  // Enable verbose logging (for development debugging only)
  static enableVerbose() {
    this.isVerbose = true;
  }

  static disableVerbose() {
    this.isVerbose = false;
  }
}

export default Logger;