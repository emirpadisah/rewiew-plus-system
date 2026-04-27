import { getBusinessById } from '@/lib/db/repositories/businesses'
import { getUsersByBusinessId } from '@/lib/db/repositories/users'
import { requireAdminUser } from '@/lib/auth/guards'
import { ApiError, handleRouteError } from '@/lib/api/errors'

const MODULE = 'Admin/BusinessUsers'
const PATH = '/api/admin/businesses/[id]/users'

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

    const users = await getUsersByBusinessId(id)

    return Response.json({
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        business_id: user.business_id,
        created_at: user.created_at,
      })),
    })
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
