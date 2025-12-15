import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getBusinessById, updateBusiness } from '@/lib/db/repositories/businesses'
import { z } from 'zod'

const updateBusinessSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['active', 'passive']).optional(),
  last_payment_at: z.string().nullable().optional(),
  next_renewal_at: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const business = await getBusinessById(id)
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json(business)
  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const updates = updateBusinessSchema.parse(body)

    const business = await updateBusiness(id, updates)

    return NextResponse.json(business)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating business:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

