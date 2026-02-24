/**
 * Logger Utility - Merkezi Loglama Sistemi
 * Tüm uygulamada tutarlı hata, uyarı, ve bilgi logları için
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  module: string
  message: string
  details?: any
  error?: {
    name: string
    message: string
    stack?: string
  }
  userId?: string
  requestId?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private enableRemoteLogging = process.env.NEXT_PUBLIC_ENABLE_REMOTE_LOGGING === 'true'

  /**
   * Hata mesajı logla
   */
  error(module: string, message: string, error?: any, details?: any) {
    const logEntry = this.formatLog('error', module, message, error, details)
    this.output('error', logEntry)
    
    if (this.enableRemoteLogging) {
      this.sendToRemote(logEntry)
    }
  }

  /**
   * Uyarı mesajı logla
   */
  warn(module: string, message: string, details?: any) {
    const logEntry = this.formatLog('warn', module, message, undefined, details)
    this.output('warn', logEntry)
  }

  /**
   * Bilgi mesajı logla
   */
  info(module: string, message: string, details?: any) {
    const logEntry = this.formatLog('info', module, message, undefined, details)
    this.output('info', logEntry)
  }

  /**
   * Debug mesajı logla (sadece development'ta)
   */
  debug(module: string, message: string, details?: any) {
    if (!this.isDevelopment) return
    
    const logEntry = this.formatLog('debug', module, message, undefined, details)
    this.output('debug', logEntry)
  }

  /**
   * API işlemi loglaması
   */
  logApiCall(
    module: string,
    method: string,
    endpoint: string,
    status?: number,
    duration?: number,
    error?: any
  ) {
    const message = `${method} ${endpoint}`
    const details = {
      method,
      endpoint,
      ...(status && { status }),
      ...(duration && { duration: `${duration}ms` }),
    }

    if (error) {
      this.error(module, `${message} - FAILED`, error, details)
    } else {
      this.info(module, `${message} - OK`, details)
    }
  }

  /**
   * Veritabanı işlemi loglaması
   */
  logDatabase(
    module: string,
    operation: string,
    table: string,
    duration?: number,
    error?: any
  ) {
    const message = `[DB] ${operation} on ${table}`
    const details = {
      operation,
      table,
      ...(duration && { duration: `${duration}ms` }),
    }

    if (error) {
      this.error(module, `${message} - FAILED`, error, details)
    } else {
      this.debug(module, `${message} - OK`, details)
    }
  }

  /**
   * WhatsApp işlemi loglaması
   */
  logWhatsApp(
    module: string,
    action: string,
    customerId?: string,
    duration?: number,
    error?: any
  ) {
    const message = `[WhatsApp] ${action}`
    const details = {
      action,
      ...(customerId && { customerId }),
      ...(duration && { duration: `${duration}ms` }),
    }

    if (error) {
      this.error(module, `${message} - FAILED`, error, details)
    } else {
      this.info(module, `${message} - OK`, details)
    }
  }

  /**
   * Kimlik doğrulama loglaması
   */
  logAuth(module: string, action: string, userId?: string, error?: any) {
    const message = `[AUTH] ${action}`
    const details = {
      action,
      ...(userId && { userId }),
    }

    if (error) {
      this.error(module, `${message} - FAILED`, error, details)
    } else {
      this.info(module, `${message} - OK`, details)
    }
  }

  /**
   * Hata detaylarını format et
   */
  private formatLog(
    level: LogLevel,
    module: string,
    message: string,
    error?: any,
    details?: any
  ): LogEntry {
    const errorInfo = error
      ? {
          name: error.name || 'Error',
          message: error.message || String(error),
          stack: this.isDevelopment ? error.stack : undefined,
        }
      : undefined

    return {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      ...(details && { details }),
      ...(errorInfo && { error: errorInfo }),
    }
  }

  /**
   * Console'a çıktı ver
   */
  private output(level: LogLevel, entry: LogEntry) {
    const prefix = this.getPrefix(level)
    const logString = this.formatLogString(entry)

    switch (level) {
      case 'error':
        console.error(`${prefix} ${logString}`)
        if (entry.error?.stack) {
          console.error(entry.error.stack)
        }
        break
      case 'warn':
        console.warn(`${prefix} ${logString}`)
        break
      case 'info':
        console.info(`${prefix} ${logString}`)
        break
      case 'debug':
        console.debug(`${prefix} ${logString}`)
        break
    }
  }

  /**
   * Log seviyesi ön eki
   */
  private getPrefix(level: LogLevel): string {
    const prefixes: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    }
    return prefixes[level]
  }

  /**
   * Log string'ini format et
   */
  private formatLogString(entry: LogEntry): string {
    let result = `[${entry.timestamp}] [${entry.module}] ${entry.message}`

    if (entry.error) {
      result += `\n  Error: ${entry.error.name}: ${entry.error.message}`
    }

    if (entry.details) {
      result += `\n  Details: ${JSON.stringify(entry.details, null, 2)}`
    }

    return result
  }

  /**
   * Remote logging servisine gönder
   */
  private async sendToRemote(entry: LogEntry) {
    try {
      // Bu endpoint'i backend'e ekleyebilirsiniz
      // await fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) })
    } catch (error) {
      // Silent fail - remote logging başarısız olursa uygulamayı etkilemesin
      console.error('Remote logging failed:', error)
    }
  }
}

// Singleton instance
export const logger = new Logger()

/**
 * Hızlı logger helper'lar - direkt import için
 */
export const log = {
  error: (module: string, message: string, error?: any, details?: any) =>
    logger.error(module, message, error, details),
  warn: (module: string, message: string, details?: any) =>
    logger.warn(module, message, details),
  info: (module: string, message: string, details?: any) =>
    logger.info(module, message, details),
  debug: (module: string, message: string, details?: any) =>
    logger.debug(module, message, details),
  api: logger.logApiCall.bind(logger),
  db: logger.logDatabase.bind(logger),
  whatsapp: logger.logWhatsApp.bind(logger),
  auth: logger.logAuth.bind(logger),
}
