import { NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/db/repositories/users'
import { verifyPassword } from '@/lib/auth/password'
import { encodeJWT } from '@/lib/auth/jwt'
import { setAuthCookie } from '@/lib/auth/cookies'
import { log } from '@/lib/logger'
import { z } from 'zod'

const MODULE = 'Auth/Login'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    log.debug(MODULE, `Giriş denemesi başlatıldı`, { email })

    const user = await getUserByEmail(email)
    if (!user) {
      log.warn(MODULE, `Kayıtlı olmayan e-posta ile giriş denemesi`, { email })
      log.api(MODULE, 'POST', '/api/auth/login', 401, Date.now() - startTime)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      log.warn(MODULE, `Hatalı şifre girişi`, { email, userId: user.id })
      log.api(MODULE, 'POST', '/api/auth/login', 401, Date.now() - startTime)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const token = await encodeJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      businessId: user.business_id || undefined,
    })

    await setAuthCookie(token)

    log.auth(MODULE, `Başarılı giriş`, user.id)
    log.info(MODULE, `Kullanıcı giriş yaptı`, {
      userId: user.id,
      email: user.email,
      role: user.role,
      durationMs: Date.now() - startTime,
    })
    
    log.api(MODULE, 'POST', '/api/auth/login', 200, Date.now() - startTime)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        businessId: user.business_id,
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error instanceof z.ZodError) {
      log.warn(MODULE, 'Geçersiz istek verisi', { errors: error.errors })
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    log.error(MODULE, 'Giriş işlemi sırasında hata oluştu', error, { durationMs: duration })
    log.api(MODULE, 'POST', '/api/auth/login', 500, duration)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

