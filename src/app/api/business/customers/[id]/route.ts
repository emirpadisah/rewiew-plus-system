import { getCustomerById, updateCustomer } from '@/lib/db/repositories/customers'
import { requireBusinessUser } from '@/lib/auth/guards'
import { ApiError, handleRouteError } from '@/lib/api/errors'
import { assertSameOrigin } from '@/lib/api/request'
import { z } from 'zod'

const MODULE = 'Business/CustomerDetail'
const PATH = '/api/business/customers/[id]'

const updateCustomerSchema = z.object({
  notes: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  try {
    assertSameOrigin(request)
    const user = await requireBusinessUser()

    const { id } = await params
    const body = await request.json()
    const data = updateCustomerSchema.parse(body)

    const customer = await getCustomerById(id)
    if (!customer || customer.business_id !== user.businessId) {
      throw new ApiError(404, 'Customer not found', 'CUSTOMER_NOT_FOUND')
    }

    const updated = await updateCustomer(id, {
      notes: data.notes !== undefined ? data.notes : undefined,
      category: data.category !== undefined ? data.category : undefined,
    })

    return Response.json(updated)
  } catch (error) {
    return handleRouteError({
      module: MODULE,
      method: 'PATCH',
      path: PATH,
      startTime,
      error,
    })
  }
}
