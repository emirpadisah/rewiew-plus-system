import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getMessageLogsByBusinessId } from '@/lib/db/repositories/message-logs'
import { getRecentMessageLogsWithCustomers } from '@/lib/db/repositories/message-logs'
import { MessageLogStatus } from '@/types'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'business' || !user.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') as MessageLogStatus | null

    const { data, count } = await getMessageLogsByBusinessId(user.businessId, {
      status: status || undefined,
      limit,
      offset,
    })

    // Get customer info for each message
    if (data.length === 0) {
      return NextResponse.json({
        data: [],
        count: 0,
      })
    }

    const customerIds = [...new Set(data.map(log => log.customer_id))]
    const { supabase } = await import('@/lib/db/supabase')
    const { data: customers } = await supabase
      .from('customers')
      .select('id, name, phone')
      .in('id', customerIds)

    const customerMap = new Map(
      (customers || []).map(c => [c.id, { name: c.name, phone: c.phone }])
    )

    const messagesWithCustomers = data.map(log => ({
      id: log.id,
      status: log.status,
      customer_name: customerMap.get(log.customer_id)?.name || 'Bilinmeyen',
      customer_phone: customerMap.get(log.customer_id)?.phone || '',
      created_at: log.created_at,
      error_message: log.error_message,
    }))

    return NextResponse.json({
      data: messagesWithCustomers,
      count: count || 0,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

