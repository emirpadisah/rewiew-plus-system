import {
  getMessageStatsByBusinessId,
  getRecentMessageLogsWithCustomers,
  getMessageStatsByDateRange,
} from '@/lib/db/repositories/message-logs'
import { getWhatsAppConnectionByBusinessId } from '@/lib/db/repositories/whatsapp-connections'
import { countCustomersByBusinessId } from '@/lib/db/repositories/customers'
import { requireBusinessUser } from '@/lib/auth/guards'
import { handleRouteError } from '@/lib/api/errors'
import { log } from '@/lib/logger'
import { getTimeZoneDayRange } from '@/lib/timezone'

const MODULE = 'Business/Stats'
const PATH = '/api/business/stats'

export async function GET() {
  const startTime = Date.now()

  try {
    const user = await requireBusinessUser()

    log.debug(MODULE, 'Fetching business statistics', { businessId: user.businessId })

    const todayRange = getTimeZoneDayRange()
    const sevenDaysAgoStart = new Date(
      new Date(todayRange.start).getTime() - 6 * 24 * 60 * 60 * 1000
    )

    const [messageStats, whatsappConnection, recentLogs, customerCount, dailyStats] =
      await Promise.all([
        getMessageStatsByBusinessId(user.businessId),
        getWhatsAppConnectionByBusinessId(user.businessId),
        getRecentMessageLogsWithCustomers(user.businessId, 10),
        countCustomersByBusinessId(user.businessId),
        getMessageStatsByDateRange(
          user.businessId,
          sevenDaysAgoStart.toISOString(),
          todayRange.endExclusive
        ),
      ])

    const successRate =
      messageStats.total > 0
        ? Math.round((messageStats.sent / messageStats.total) * 100)
        : 0

    const todayStats =
      dailyStats.find((stats) => stats.date === todayRange.dateKey) || {
        sent: 0,
        failed: 0,
      }

    log.info(MODULE, 'Business statistics fetched', {
      businessId: user.businessId,
      totalMessages: messageStats.total,
      successRate,
      whatsappStatus: whatsappConnection?.status,
      totalCustomers: customerCount,
      durationMs: Date.now() - startTime,
    })
    log.api(MODULE, 'GET', PATH, 200, Date.now() - startTime)

    return Response.json({
      messages: {
        ...messageStats,
        successRate,
        today: todayStats,
      },
      whatsapp: {
        status: whatsappConnection?.status || 'disconnected',
        lastSeenAt: whatsappConnection?.last_seen_at,
      },
      customers: {
        total: customerCount,
      },
      recentLogs: recentLogs.slice(0, 10),
      dailyStats: dailyStats.slice(-7),
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
