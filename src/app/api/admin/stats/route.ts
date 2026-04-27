import {
  getBusinessStats,
  getRecentBusinesses,
} from '@/lib/db/repositories/businesses'
import { getTotalMessageCount } from '@/lib/db/repositories/message-logs'
import { requireAdminUser } from '@/lib/auth/guards'
import { handleRouteError } from '@/lib/api/errors'
import { log } from '@/lib/logger'

const MODULE = 'Admin/Stats'
const PATH = '/api/admin/stats'

export async function GET() {
  const startTime = Date.now()

  try {
    await requireAdminUser()

    log.debug(MODULE, 'Fetching global statistics')

    const [businessStats, totalMessages, recentBusinesses] = await Promise.all([
      getBusinessStats(),
      getTotalMessageCount(),
      getRecentBusinesses(5),
    ])

    const activeRate =
      businessStats.total > 0
        ? Math.round((businessStats.active / businessStats.total) * 100)
        : 0

    log.info(MODULE, 'Global statistics fetched', {
      totalBusinesses: businessStats.total,
      activeBusinesses: businessStats.active,
      activeRate,
      totalMessages,
      durationMs: Date.now() - startTime,
    })
    log.api(MODULE, 'GET', PATH, 200, Date.now() - startTime)

    return Response.json({
      businesses: {
        ...businessStats,
        activeRate,
      },
      totalMessages,
      recentBusinesses: recentBusinesses.map((business) => ({
        id: business.id,
        name: business.name,
        status: business.status,
        created_at: business.created_at,
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
