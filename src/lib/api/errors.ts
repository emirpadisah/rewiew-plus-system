import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { log } from '@/lib/logger'

export class ApiError extends Error {
  status: number
  code?: string
  details?: unknown

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function validationDetails(error: ZodError) {
  return error.errors.map((issue) => ({
    code: issue.code,
    message: issue.message,
    path: issue.path.join('.'),
  }))
}

export function jsonError(
  status: number,
  message: string,
  code?: string,
  details?: unknown
) {
  return NextResponse.json(
    {
      error: message,
      ...(code ? { code } : {}),
      ...(details ? { details } : {}),
    },
    { status }
  )
}

interface HandleRouteErrorOptions {
  module: string
  method: string
  path: string
  startTime: number
  error: unknown
}

export function handleRouteError({
  module,
  method,
  path,
  startTime,
  error,
}: HandleRouteErrorOptions) {
  const duration = Date.now() - startTime

  if (error instanceof ZodError) {
    log.warn(module, 'Invalid request data', {
      issues: validationDetails(error),
      method,
      path,
      durationMs: duration,
    })
    log.api(module, method, path, 400, duration)

    return jsonError(
      400,
      'Invalid request data',
      'INVALID_REQUEST',
      validationDetails(error)
    )
  }

  if (error instanceof ApiError) {
    if (error.status >= 500) {
      log.error(module, error.message, error, {
        code: error.code,
        method,
        path,
        durationMs: duration,
      })
    } else {
      log.warn(module, error.message, {
        code: error.code,
        method,
        path,
        durationMs: duration,
      })
    }

    log.api(module, method, path, error.status, duration)
    return jsonError(error.status, error.message, error.code, error.details)
  }

  log.error(module, 'Unhandled route error', error, {
    method,
    path,
    durationMs: duration,
  })
  log.api(module, method, path, 500, duration)

  return jsonError(500, 'Internal server error', 'INTERNAL_SERVER_ERROR')
}
