import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getMessageStatsByAllBusinesses } from '@/lib/db/repositories/message-logs'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await getMessageStatsByAllBusinesses()

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching message stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

