import { SignJWT, jwtVerify } from 'jose'
import { JWTPayload } from '@/types'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production'
)

const JWT_COOKIE_NAME = 'auth-token'

export async function encodeJWT(payload: JWTPayload): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  return jwt
}

export async function decodeJWT(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secret)
  return payload as JWTPayload
}

export { JWT_COOKIE_NAME }

