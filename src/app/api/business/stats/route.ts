import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { 
  getMessageStatsByBusinessId,
  getRecentMessageLogsWithCustomers,
  getMessageStatsByDateRange,
} from '@/lib/db/repositories/message-logs'
import { getWhatsAppConnectionByBusinessId } from '@/lib/db/repositories/whatsapp-connections'
import { getCustomersByBusinessId } from '@/lib/db/repositories/customers'
import { log } from '@/lib/logger'

const MODULE = 'Business/Stats'

export async function GET() {
  const startTime = Date.now()
  
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'business' || !user.businessId) {
      log.api(MODULE, 'GET', '/api/business/stats', 401)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    log.debug(MODULE, 'İstatistikler çekiliyor başlatıldı', { businessId: user.businessId })

    // Get today and last 7 days for stats
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const [messageStats, whatsappConnection, recentLogs, customerCount, dailyStats] = await Promise.all([
      getMessageStatsByBusinessId(user.businessId),
      getWhatsAppConnectionByBusinessId(user.businessId),
      getRecentMessageLogsWithCustomers(user.businessId, 10),
      getCustomersByBusinessId(user.businessId, { limit: 1 }),
      getMessageStatsByDateRange(
        user.businessId,
        sevenDaysAgo.toISOString(),
        today.toISOString()
      ),
    ])

    // Calculate success rate
    const successRate = messageStats.total > 0 
      ? Math.round((messageStats.sent / messageStats.total) * 100) 
      : 0

    // Calculate today's stats
    const todayStr = today.toISOString().split('T')[0]
    const todayStats = dailyStats.find(s => s.date === todayStr) || { sent: 0, failed: 0 }

    log.info(MODULE, 'İstatistikler başarıyla çekildi', {
      businessId: user.businessId,
      totalMessages: messageStats.total,
      successRate,
      whatsappStatus: whatsappConnection?.status,
      totalCustomers: customerCount.count,
      durationMs: Date.now() - startTime,
    })

    log.api(MODULE, 'GET', '/api/business/stats', 200, Date.now() - startTime)

    return NextResponse.json({
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
        total: customerCount.count,
      },
      recentLogs: recentLogs.slice(0, 10),
      dailyStats: dailyStats.slice(-7), // Last 7 days
    })
  } catch (error) {
    const duration = Date.now() - startTime
    log.error(MODULE, 'İstatistikler çekilirken hata oluştu', error, { durationMs: duration })
    log.api(MODULE, 'GET', '/api/business/stats', 500, duration)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

