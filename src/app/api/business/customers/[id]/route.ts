import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { updateCustomer, getCustomerById } from '@/lib/db/repositories/customers'
import { z } from 'zod'

const updateCustomerSchema = z.object({
  notes: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'business' || !user.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const data = updateCustomerSchema.parse(body)

    // Verify customer belongs to business
    const customer = await getCustomerById(id)
    if (!customer || customer.business_id !== user.businessId) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const updated = await updateCustomer(id, {
      notes: data.notes !== undefined ? data.notes : undefined,
      category: data.category !== undefined ? data.category : undefined,
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating customer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

