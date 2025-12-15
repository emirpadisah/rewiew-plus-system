import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import {
  getCustomersByBusinessId,
  createCustomer,
  createCustomersBulk,
} from '@/lib/db/repositories/customers'
import { z } from 'zod'

const createCustomerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format'),
})

const createCustomersBulkSchema = z.object({
  customers: z.array(createCustomerSchema),
})

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'business' || !user.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await getCustomersByBusinessId(user.businessId, {
      search,
      limit,
      offset,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'business' || !user.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Check if it's bulk or single
    if (body.customers && Array.isArray(body.customers)) {
      const data = createCustomersBulkSchema.parse(body)
      const customers = await createCustomersBulk(
        data.customers.map((c) => ({
          ...c,
          business_id: user.businessId!,
        }))
      )
      return NextResponse.json({ customers }, { status: 201 })
    } else {
      const data = createCustomerSchema.parse(body)
      const customer = await createCustomer({
        ...data,
        business_id: user.businessId!,
      })
      return NextResponse.json(customer, { status: 201 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

