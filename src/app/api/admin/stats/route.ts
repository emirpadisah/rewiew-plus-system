import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getBusinessStats, getAllBusinesses } from '@/lib/db/repositories/businesses'
import { getTotalMessageCount, getMessageStatsByDateRange } from '@/lib/db/repositories/message-logs'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get today and last 7 days for stats
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [businessStats, totalMessages, allBusinesses, dailyStats] = await Promise.all([
      getBusinessStats(),
      getTotalMessageCount(),
      getAllBusinesses({ limit: 1000 }),
      // Get daily stats for all businesses (we'll aggregate in memory)
      Promise.resolve([]), // Will implement if needed
    ])

    // Calculate active rate
    const activeRate = businessStats.total > 0
      ? Math.round((businessStats.active / businessStats.total) * 100)
      : 0

    // Get recent businesses (last 5)
    const recentBusinesses = allBusinesses.data
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)

    return NextResponse.json({
      businesses: {
        ...businessStats,
        activeRate,
      },
      totalMessages,
      recentBusinesses: recentBusinesses.map(b => ({
        id: b.id,
        name: b.name,
        status: b.status,
        created_at: b.created_at,
      })),
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

