import { SignJWT, jwtVerify } from 'jose'
import { z } from 'zod'
import { JWTPayload } from '@/types'
import { getRequiredServerEnv } from '@/lib/env'

const JWT_ISSUER = 'yorum-arttirici'
const JWT_AUDIENCE = 'yorum-arttirici-app'
const JWT_COOKIE_NAME = 'auth-token'

const jwtPayloadSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'business']),
  businessId: z.string().min(1).optional(),
})

function getJwtSecret() {
  return new TextEncoder().encode(getRequiredServerEnv('JWT_SECRET'))
}

export async function encodeJWT(payload: JWTPayload): Promise<string> {
  const parsedPayload = jwtPayloadSchema.parse(payload)

  const jwt = await new SignJWT(parsedPayload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setSubject(parsedPayload.userId)
    .setExpirationTime('7d')
    .sign(getJwtSecret())

  return jwt
}

export async function decodeJWT(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  })

  return jwtPayloadSchema.parse({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    businessId: payload.businessId,
  })
}

export { JWT_COOKIE_NAME }

