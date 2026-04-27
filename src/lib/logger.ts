/**
 * Logger Utility - centralized application logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  module: string
  message: string
  details?: unknown
  error?: {
    name: string
    message: string
    stack?: string
  }
  userId?: string
  requestId?: string
}

const REDACTED = '[REDACTED]'

function maskEmail(value: string) {
  const [localPart, domain = ''] = value.split('@')

  if (!localPart || !domain) {
    return REDACTED
  }

  const visible = localPart.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(localPart.length - visible.length, 1))}@${domain}`
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, '')

  if (digits.length < 4) {
    return REDACTED
  }

  return `${'*'.repeat(Math.max(digits.length - 4, 1))}${digits.slice(-4)}`
}

function isSensitiveKey(key: string) {
  const normalizedKey = key.toLowerCase()

  return [
    'password',
    'password_hash',
    'token',
    'authorization',
    'cookie',
    'secret',
    'apikey',
    'api_key',
    'qrcode',
    'base64',
    'pairingcode',
    'pairing_code',
    'message_template',
    'template',
    'text',
  ].some((candidate) => normalizedKey.includes(candidate))
}

function sanitizeValue(value: unknown, key?: string): unknown {
  if (value == null) {
    return value
  }

  if (typeof value === 'string') {
    const normalizedKey = key?.toLowerCase() || ''

    if (isSensitiveKey(normalizedKey)) {
      return REDACTED
    }

    if (normalizedKey.includes('email')) {
      return maskEmail(value)
    }

    if (
      normalizedKey.includes('phone') ||
      normalizedKey === 'number' ||
      normalizedKey.includes('ip')
    ) {
      return maskPhone(value)
    }

    if (value.startsWith('data:') || value.length > 500) {
      return REDACTED
    }

    return value
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((entry) => sanitizeValue(entry))
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([entryKey, entryValue]) => [
        entryKey,
        sanitizeValue(entryValue, entryKey),
      ])
    )
  }

  return value
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private enableRemoteLogging = process.env.NEXT_PUBLIC_ENABLE_REMOTE_LOGGING === 'true'

  error(module: string, message: string, error?: unknown, details?: unknown) {
    const logEntry = this.formatLog('error', module, message, error, details)
    this.output('error', logEntry)

    if (this.enableRemoteLogging) {
      void this.sendToRemote(logEntry)
    }
  }

  warn(module: string, message: string, details?: unknown) {
    const logEntry = this.formatLog('warn', module, message, undefined, details)
    this.output('warn', logEntry)
  }

  info(module: string, message: string, details?: unknown) {
    const logEntry = this.formatLog('info', module, message, undefined, details)
    this.output('info', logEntry)
  }

  debug(module: string, message: string, details?: unknown) {
    if (!this.isDevelopment) {
      return
    }

    const logEntry = this.formatLog('debug', module, message, undefined, details)
    this.output('debug', logEntry)
  }

  logApiCall(
    module: string,
    method: string,
    endpoint: string,
    status?: number,
    duration?: number,
    error?: unknown
  ) {
    const message = `${method} ${endpoint}`
    const details = {
      method,
      endpoint,
      ...(status ? { status } : {}),
      ...(duration ? { duration: `${duration}ms` } : {}),
    }

    if (error) {
      this.error(module, `${message} - FAILED`, error, details)
    } else {
      this.info(module, `${message} - OK`, details)
    }
  }

  logDatabase(
    module: string,
    operation: string,
    table: string,
    duration?: number,
    error?: unknown
  ) {
    const message = `[DB] ${operation} on ${table}`
    const details = {
      operation,
      table,
      ...(duration ? { duration: `${duration}ms` } : {}),
    }

    if (error) {
      this.error(module, `${message} - FAILED`, error, details)
    } else {
      this.debug(module, `${message} - OK`, details)
    }
  }

  logWhatsApp(
    module: string,
    action: string,
    customerId?: string,
    duration?: number,
    error?: unknown
  ) {
    const message = `[WhatsApp] ${action}`
    const details = {
      action,
      ...(customerId ? { customerId } : {}),
      ...(duration ? { duration: `${duration}ms` } : {}),
    }

    if (error) {
      this.error(module, `${message} - FAILED`, error, details)
    } else {
      this.info(module, `${message} - OK`, details)
    }
  }

  logAuth(module: string, action: string, userId?: string, error?: unknown) {
    const message = `[AUTH] ${action}`
    const details = {
      action,
      ...(userId ? { userId } : {}),
    }

    if (error) {
      this.error(module, `${message} - FAILED`, error, details)
    } else {
      this.info(module, `${message} - OK`, details)
    }
  }

  private formatLog(
    level: LogLevel,
    module: string,
    message: string,
    error?: unknown,
    details?: unknown
  ): LogEntry {
    const errorObject = error as { name?: string; message?: string; stack?: string } | undefined
    const errorInfo = errorObject
      ? {
          name: errorObject.name || 'Error',
          message:
            typeof errorObject.message === 'string' ? errorObject.message : String(errorObject),
          stack: this.isDevelopment ? errorObject.stack : undefined,
        }
      : undefined

    return {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      ...(details ? { details: sanitizeValue(details) } : {}),
      ...(errorInfo ? { error: sanitizeValue(errorInfo) as LogEntry['error'] } : {}),
    }
  }

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

  private getPrefix(level: LogLevel): string {
    const prefixes: Record<LogLevel, string> = {
      debug: '[DEBUG]',
      info: '[INFO]',
      warn: '[WARN]',
      error: '[ERROR]',
    }

    return prefixes[level]
  }

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

  private async sendToRemote(entry: LogEntry) {
    try {
      void entry
    } catch (error) {
      console.error('Remote logging failed:', error)
    }
  }
}

export const logger = new Logger()

export const log = {
  error: (module: string, message: string, error?: unknown, details?: unknown) =>
    logger.error(module, message, error, details),
  warn: (module: string, message: string, details?: unknown) =>
    logger.warn(module, message, details),
  info: (module: string, message: string, details?: unknown) =>
    logger.info(module, message, details),
  debug: (module: string, message: string, details?: unknown) =>
    logger.debug(module, message, details),
  api: logger.logApiCall.bind(logger),
  db: logger.logDatabase.bind(logger),
  whatsapp: logger.logWhatsApp.bind(logger),
  auth: logger.logAuth.bind(logger),
}
