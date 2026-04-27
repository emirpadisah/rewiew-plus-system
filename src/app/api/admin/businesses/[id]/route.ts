import { getBusinessById, updateBusiness } from '@/lib/db/repositories/businesses'
import { requireAdminUser } from '@/lib/auth/guards'
import { ApiError, handleRouteError } from '@/lib/api/errors'
import { assertSameOrigin } from '@/lib/api/request'
import { z } from 'zod'

const MODULE = 'Admin/BusinessDetail'
const PATH = '/api/admin/businesses/[id]'

const updateBusinessSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['active', 'passive']).optional(),
  package_tier: z.enum(['starter', 'standard', 'pro']).nullable().optional(),
  last_payment_at: z.string().nullable().optional(),
  next_renewal_at: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  try {
    await requireAdminUser()

    const { id } = await params
    const business = await getBusinessById(id)

    if (!business) {
      throw new ApiError(404, 'Business not found', 'BUSINESS_NOT_FOUND')
    }

    return Response.json(business)
  } catch (error) {
    return handleRouteError({
      module: MODULE,
      method: 'GET',
      path: PATH,
      startTime,
      error,
    })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  try {
    assertSameOrigin(request)
    await requireAdminUser()

    const { id } = await params
    const existingBusiness = await getBusinessById(id)

    if (!existingBusiness) {
      throw new ApiError(404, 'Business not found', 'BUSINESS_NOT_FOUND')
    }

    const body = await request.json()
    const updates = updateBusinessSchema.parse(body)

    const business = await updateBusiness(id, updates)
    return Response.json(business)
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
