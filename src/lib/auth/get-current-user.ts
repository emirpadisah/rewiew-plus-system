import { getAuthCookie } from './cookies'
import { decodeJWT } from './jwt'
import { JWTPayload } from '@/types'

export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const token = await getAuthCookie()
    if (!token) return null

    const payload = await decodeJWT(token)
    return payload
  } catch {
    return null
  }
}

