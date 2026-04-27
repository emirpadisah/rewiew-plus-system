import { getUserByEmail } from '@/lib/db/repositories/users'
import { verifyPassword } from '@/lib/auth/password'
import { encodeJWT } from '@/lib/auth/jwt'
import { setAuthCookie } from '@/lib/auth/cookies'
import {
  clearLoginRateLimit,
  getLoginBlockState,
  recordFailedLoginAttempt,
} from '@/lib/auth/login-rate-limit'
import { ApiError, handleRouteError, jsonError } from '@/lib/api/errors'
import { assertSameOrigin, getClientIp, normalizeEmail } from '@/lib/api/request'
import { log } from '@/lib/logger'
import { z } from 'zod'

const MODULE = 'Auth/Login'
const PATH = '/api/auth/login'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    assertSameOrigin(request)

    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const normalizedEmail = normalizeEmail(email)
    const clientIp = getClientIp(request)
    const blockState = await getLoginBlockState(normalizedEmail, clientIp)

    if (blockState.blocked) {
      throw new ApiError(429, 'Too many login attempts. Please try again later.', 'LOGIN_RATE_LIMITED', {
        blockedUntil: blockState.blockedUntil,
      })
    }

    log.debug(MODULE, 'Login attempt started', {
      email: normalizedEmail,
      clientIp,
    })

    const user = await getUserByEmail(normalizedEmail)
    if (!user) {
      const failureState = await recordFailedLoginAttempt(normalizedEmail, clientIp)

      if (failureState.blocked) {
        return jsonError(429, 'Too many login attempts. Please try again later.', 'LOGIN_RATE_LIMITED', {
          blockedUntil: failureState.blockedUntil,
        })
      }

      log.warn(MODULE, 'Unknown email login attempt', { email: normalizedEmail, clientIp })
      log.api(MODULE, 'POST', PATH, 401, Date.now() - startTime)
      return jsonError(401, 'Invalid email or password', 'INVALID_CREDENTIALS')
    }

    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      const failureState = await recordFailedLoginAttempt(normalizedEmail, clientIp)

      if (failureState.blocked) {
        return jsonError(429, 'Too many login attempts. Please try again later.', 'LOGIN_RATE_LIMITED', {
          blockedUntil: failureState.blockedUntil,
        })
      }

      log.warn(MODULE, 'Invalid password attempt', {
        email: normalizedEmail,
        userId: user.id,
        clientIp,
      })
      log.api(MODULE, 'POST', PATH, 401, Date.now() - startTime)
      return jsonError(401, 'Invalid email or password', 'INVALID_CREDENTIALS')
    }

    await clearLoginRateLimit(normalizedEmail, clientIp)

    const token = await encodeJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      businessId: user.business_id || undefined,
    })

    await setAuthCookie(token)

    log.auth(MODULE, 'Successful login', user.id)
    log.info(MODULE, 'User logged in', {
      userId: user.id,
      email: user.email,
      role: user.role,
      durationMs: Date.now() - startTime,
    })
    log.api(MODULE, 'POST', PATH, 200, Date.now() - startTime)

    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        businessId: user.business_id,
      },
    })
  } catch (error) {
    return handleRouteError({
      module: MODULE,
      method: 'POST',
      path: PATH,
      startTime,
      error,
    })
  }
}
