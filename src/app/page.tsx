import { redirect } from 'next/navigation'
import { getAuthCookie } from '@/lib/auth/cookies'
import { decodeJWT } from '@/lib/auth/jwt'

export default async function Home() {
  const token = await getAuthCookie()
  
  if (token) {
    try {
      const payload = await decodeJWT(token)
      if (payload.role === 'admin') {
        redirect('/admin')
      } else if (payload.role === 'business') {
        redirect('/business')
      }
    } catch {
      redirect('/auth/login')
    }
  }
  
  redirect('/auth/login')
}

