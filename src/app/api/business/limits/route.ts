import { getBusinessLimitsSnapshot } from '@/lib/business-limits'
import { requireBusinessUser } from '@/lib/auth/guards'
import { handleRouteError } from '@/lib/api/errors'

const MODULE = 'Business/Limits'
const PATH = '/api/business/limits'

export async function GET() {
  const startTime = Date.now()

  try {
    const user = await requireBusinessUser()
    const limits = await getBusinessLimitsSnapshot(user.businessId)

    return Response.json(limits)
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
