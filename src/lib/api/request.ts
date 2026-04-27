import { z } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { getRequestBaseUrl } from '@/lib/env'

interface ListQueryOptions<TStatus extends readonly [string, ...string[]] | undefined> {
  defaultLimit?: number
  maxLimit?: number
  maxSearchLength?: number
  statusValues?: TStatus
}

type ParsedListQuery<TStatus extends readonly [string, ...string[]] | undefined> = {
  limit: number
  offset: number
  search?: string
  status?: TStatus extends readonly [string, ...string[]] ? TStatus[number] : undefined
}

function buildListQuerySchema<TStatus extends readonly [string, ...string[]] | undefined>(
  options: ListQueryOptions<TStatus>
) {
  const defaultLimit = options.defaultLimit ?? 20
  const maxLimit = options.maxLimit ?? 100
  const maxSearchLength = options.maxSearchLength ?? 100

  const schemaShape: Record<string, z.ZodTypeAny> = {
    limit: z.coerce.number().int().min(1).max(maxLimit).default(defaultLimit),
    offset: z.coerce.number().int().min(0).default(0),
    search: z
      .string()
      .trim()
      .max(maxSearchLength)
      .optional()
      .transform((value) => normalizeSearchTerm(value, maxSearchLength)),
  }

  if (options.statusValues) {
    schemaShape.status = z.enum(options.statusValues).optional()
  }

  return z.object(schemaShape)
}

export function parseListQuery<TStatus extends readonly [string, ...string[]] | undefined>(
  request: Request,
  options: ListQueryOptions<TStatus> = {}
): ParsedListQuery<TStatus> {
  const raw = Object.fromEntries(new URL(request.url).searchParams.entries())
  const schema = buildListQuerySchema(options)
  return schema.parse(raw) as ParsedListQuery<TStatus>
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function normalizeSearchTerm(value?: string, maxLength: number = 100) {
  if (!value) {
    return undefined
  }

  const normalized = value
    .normalize('NFKC')
    .replace(/[,%_*()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)

  return normalized || undefined
}

export function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, '\\$&')
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  const expectedOrigin = getRequestBaseUrl(request)

  if (!origin || origin !== expectedOrigin) {
    throw new ApiError(403, 'Forbidden', 'INVALID_ORIGIN')
  }
}
