import {
  clearLoginRateLimitRecord,
  getLoginRateLimitRecord,
  upsertLoginRateLimitRecord,
} from '@/lib/db/repositories/login-rate-limits'

const WINDOW_MS = 15 * 60 * 1000
const BLOCK_MS = 30 * 60 * 1000
const MAX_ATTEMPTS = 5

function isBlocked(blockedUntil: string | null, now: Date) {
  return Boolean(blockedUntil && new Date(blockedUntil).getTime() > now.getTime())
}

export async function getLoginBlockState(normalizedEmail: string, ipAddress: string) {
  const record = await getLoginRateLimitRecord(normalizedEmail, ipAddress)
  const now = new Date()

  if (!record) {
    return {
      blocked: false,
      blockedUntil: null as string | null,
      remainingAttempts: MAX_ATTEMPTS,
    }
  }

  if (isBlocked(record.blocked_until, now)) {
    return {
      blocked: true,
      blockedUntil: record.blocked_until,
      remainingAttempts: 0,
    }
  }

  const windowStartedAt = new Date(record.window_started_at)
  const withinWindow = now.getTime() - windowStartedAt.getTime() < WINDOW_MS
  const attemptsUsed = withinWindow ? record.failed_attempts : 0

  return {
    blocked: false,
    blockedUntil: null,
    remainingAttempts: Math.max(MAX_ATTEMPTS - attemptsUsed, 0),
  }
}

export async function recordFailedLoginAttempt(
  normalizedEmail: string,
  ipAddress: string
) {
  const record = await getLoginRateLimitRecord(normalizedEmail, ipAddress)
  const now = new Date()

  if (!record) {
    await upsertLoginRateLimitRecord({
      normalized_email: normalizedEmail,
      ip_address: ipAddress,
      failed_attempts: 1,
      window_started_at: now.toISOString(),
      last_attempt_at: now.toISOString(),
      blocked_until: null,
    })

    return {
      blocked: false,
      blockedUntil: null as string | null,
      remainingAttempts: MAX_ATTEMPTS - 1,
    }
  }

  const windowStartedAt = new Date(record.window_started_at)
  const withinWindow = now.getTime() - windowStartedAt.getTime() < WINDOW_MS
  const nextAttempts = withinWindow ? record.failed_attempts + 1 : 1
  const blockedUntil = nextAttempts >= MAX_ATTEMPTS ? new Date(now.getTime() + BLOCK_MS) : null

  await upsertLoginRateLimitRecord({
    normalized_email: normalizedEmail,
    ip_address: ipAddress,
    failed_attempts: nextAttempts,
    window_started_at: withinWindow ? record.window_started_at : now.toISOString(),
    last_attempt_at: now.toISOString(),
    blocked_until: blockedUntil?.toISOString() || null,
  })

  return {
    blocked: Boolean(blockedUntil),
    blockedUntil: blockedUntil?.toISOString() || null,
    remainingAttempts: blockedUntil ? 0 : Math.max(MAX_ATTEMPTS - nextAttempts, 0),
  }
}

export async function clearLoginRateLimit(normalizedEmail: string, ipAddress: string) {
  await clearLoginRateLimitRecord(normalizedEmail, ipAddress)
}
