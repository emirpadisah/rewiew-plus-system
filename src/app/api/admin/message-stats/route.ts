import { getMessageStatsByAllBusinesses } from '@/lib/db/repositories/message-logs'
import { requireAdminUser } from '@/lib/auth/guards'
import { handleRouteError } from '@/lib/api/errors'

const MODULE = 'Admin/MessageStats'
const PATH = '/api/admin/message-stats'

export async function GET() {
  const startTime = Date.now()

  try {
    await requireAdminUser()

    const stats = await getMessageStatsByAllBusinesses()
    return Response.json({ stats })
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
