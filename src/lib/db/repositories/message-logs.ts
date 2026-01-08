import { supabase } from '../supabase'
import { MessageLog, MessageLogStatus } from '@/types'

export async function createMessageLog(data: {
  business_id: string
  customer_id: string
  status: MessageLogStatus
  error_message?: string | null
}): Promise<MessageLog> {
  const { data: log, error } = await supabase
    .from('message_logs')
    .insert({
      business_id: data.business_id,
      customer_id: data.customer_id,
      status: data.status,
      error_message: data.error_message || null,
    })
    .select()
    .single()

  if (error) throw error
  return log
}

export async function getMessageLogsByBusinessId(
  businessId: string,
  params?: {
    status?: MessageLogStatus
    limit?: number
    offset?: number
  }
): Promise<{ data: MessageLog[]; count: number }> {
  let query = supabase
    .from('message_logs')
    .select('*', { count: 'exact' })
    .eq('business_id', businessId)

  if (params?.status) {
    query = query.eq('status', params.status)
  }

  if (params?.limit) {
    query = query.limit(params.limit)
  }

  if (params?.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error, count } = await query

  if (error) throw error
  return { data: data || [], count: count || 0 }
}

export async function getMessageStatsByBusinessId(businessId: string): Promise<{
  total: number
  sent: number
  failed: number
}> {
  const { count: total, error: totalError } = await supabase
    .from('message_logs')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)

  if (totalError) throw totalError

  const { count: sent, error: sentError } = await supabase
    .from('message_logs')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('status', 'sent')

  if (sentError) throw sentError

  const { count: failed, error: failedError } = await supabase
    .from('message_logs')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('status', 'failed')

  if (failedError) throw failedError

  return {
    total: total || 0,
    sent: sent || 0,
    failed: failed || 0,
  }
}

export async function getTotalMessageCount(): Promise<number> {
  const { count, error } = await supabase
    .from('message_logs')
    .select('*', { count: 'exact', head: true })

  if (error) throw error

  return count || 0
}

/**
 * Get message statistics for all businesses
 * Returns array of businesses with their message stats
 */
export async function getMessageStatsByAllBusinesses(): Promise<Array<{
  business_id: string
  business_name: string
  total: number
  sent: number
  failed: number
  success_rate: number
  last_message_at: string | null
}>> {
  // Get all message logs grouped by business
  const { data: logs, error: logsError } = await supabase
    .from('message_logs')
    .select('business_id, status, created_at')
    .order('created_at', { ascending: false })

  if (logsError) throw logsError

  // Get all businesses
  const { data: businesses, error: businessesError } = await supabase
    .from('businesses')
    .select('id, name')

  if (businessesError) throw businessesError

  // Create business map
  const businessMap = new Map(
    (businesses || []).map(b => [b.id, b.name])
  )

  // Group logs by business_id
  const statsMap = new Map<string, {
    total: number
    sent: number
    failed: number
    last_message_at: string | null
  }>()

  logs?.forEach((log) => {
    const existing = statsMap.get(log.business_id) || {
      total: 0,
      sent: 0,
      failed: 0,
      last_message_at: null,
    }

    existing.total++
    if (log.status === 'sent') {
      existing.sent++
    } else {
      existing.failed++
    }

    // Track latest message date
    if (!existing.last_message_at || log.created_at > existing.last_message_at) {
      existing.last_message_at = log.created_at
    }

    statsMap.set(log.business_id, existing)
  })

  // Convert to array and calculate success rate
  return Array.from(statsMap.entries()).map(([business_id, stats]) => ({
    business_id,
    business_name: businessMap.get(business_id) || 'Bilinmeyen İşletme',
    total: stats.total,
    sent: stats.sent,
    failed: stats.failed,
    success_rate: stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0,
    last_message_at: stats.last_message_at,
  })).sort((a, b) => b.total - a.total) // Sort by total messages descending
}

export async function getRecentMessageLogsWithCustomers(
  businessId: string,
  limit: number = 10
): Promise<Array<MessageLog & { customer_name: string; customer_phone: string }>> {
  // Get recent message logs
  const { data: logs, error: logsError } = await supabase
    .from('message_logs')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (logsError) throw logsError
  if (!logs || logs.length === 0) return []

  // Get customer IDs
  const customerIds = [...new Set(logs.map(log => log.customer_id))]

  // Get customers
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('id, name, phone')
    .in('id', customerIds)

  if (customersError) throw customersError

  // Create customer map
  const customerMap = new Map(
    (customers || []).map(c => [c.id, { name: c.name, phone: c.phone }])
  )

  // Combine logs with customer info
  return logs.map(log => ({
    ...log,
    customer_name: customerMap.get(log.customer_id)?.name || 'Bilinmeyen',
    customer_phone: customerMap.get(log.customer_id)?.phone || '',
  }))
}

export async function getMessageStatsByDateRange(
  businessId: string,
  startDate: string,
  endDate: string
): Promise<{
  date: string
  sent: number
  failed: number
}[]> {
  const { data, error } = await supabase
    .from('message_logs')
    .select('status, created_at')
    .eq('business_id', businessId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  if (error) throw error

  // Group by date
  const grouped: Record<string, { sent: number; failed: number }> = {}
  
  data?.forEach((log) => {
    const date = new Date(log.created_at).toISOString().split('T')[0]
    if (!grouped[date]) {
      grouped[date] = { sent: 0, failed: 0 }
    }
    if (log.status === 'sent') {
      grouped[date].sent++
    } else {
      grouped[date].failed++
    }
  })

  return Object.entries(grouped).map(([date, stats]) => ({
    date,
    ...stats,
  }))
}
