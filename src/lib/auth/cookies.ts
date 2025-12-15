import { cookies } from 'next/headers'
import { JWT_COOKIE_NAME } from './jwt'

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function deleteAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(JWT_COOKIE_NAME)
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(JWT_COOKIE_NAME)?.value
}

