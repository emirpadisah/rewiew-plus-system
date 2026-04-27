import { getBusinessById } from '@/lib/db/repositories/businesses'
import { requireBusinessUser } from '@/lib/auth/guards'
import { ApiError, handleRouteError } from '@/lib/api/errors'

const MODULE = 'Business/Info'
const PATH = '/api/business/info'

export async function GET() {
  const startTime = Date.now()

  try {
    const user = await requireBusinessUser()
    const business = await getBusinessById(user.businessId)

    if (!business) {
      throw new ApiError(404, 'Business not found', 'BUSINESS_NOT_FOUND')
    }

    return Response.json({ name: business.name })
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
