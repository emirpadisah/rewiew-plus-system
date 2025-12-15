import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getAllBusinesses, createBusiness } from '@/lib/db/repositories/businesses'
import { createUser } from '@/lib/db/repositories/users'
import { hashPassword } from '@/lib/auth/password'
import { z } from 'zod'

const createBusinessSchema = z.object({
  name: z.string().min(1),
  status: z.enum(['active', 'passive']).optional(),
  notes: z.string().optional(),
  userEmail: z.string().email().optional(),
  userPassword: z.string().min(6).optional(),
})

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') as 'active' | 'passive' | undefined
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await getAllBusinesses({
      search,
      status,
      limit,
      offset,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createBusinessSchema.parse(body)

    // İşletmeyi oluştur
    const business = await createBusiness({
      name: data.name,
      status: data.status,
      notes: data.notes,
    })

    // Eğer email ve şifre verilmişse, kullanıcı da oluştur
    if (data.userEmail && data.userPassword) {
      const password_hash = await hashPassword(data.userPassword)
      await createUser({
        email: data.userEmail,
        password_hash,
        role: 'business',
        business_id: business.id,
      })
    }

    return NextResponse.json(
      {
        ...business,
        userCreated: !!(data.userEmail && data.userPassword),
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating business:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

