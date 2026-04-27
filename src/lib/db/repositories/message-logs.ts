import { supabase } from '../supabase'
import { MessageLog, MessageLogStatus } from '@/types'
import { getTimeZoneDateKey } from '@/lib/timezone'

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

  if (params?.limit !== undefined) {
    const limit = params.limit
    const offset = params.offset ?? 0
    query = query.range(offset, offset + limit - 1)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error, count } = await query

  if (error) throw error
  return { data: data || [], count: count || 0 }
}

export async function getMessageLogsWithCustomersByBusinessId(
  businessId: string,
  params?: {
    status?: MessageLogStatus
    limit?: number
    offset?: number
  }
): Promise<{
  data: Array<{
    id: string
    customer_id: string
    status: MessageLogStatus
    customer_name: string
    customer_phone: string
    created_at: string
    error_message: string | null
  }>
  count: number
}> {
  const { data: logs, count } = await getMessageLogsByBusinessId(businessId, params)

  if (logs.length === 0) {
    return {
      data: [],
      count: count || 0,
    }
  }

  const customerIds = [...new Set(logs.map((log) => log.customer_id))]
  const { data: customers, error } = await supabase
    .from('customers')
    .select('id, name, phone')
    .eq('business_id', businessId)
    .in('id', customerIds)

  if (error) throw error

  const customerMap = new Map(
    (customers || []).map((customer) => [customer.id, customer])
  )

  return {
    data: logs.map((log) => ({
      id: log.id,
      customer_id: log.customer_id,
      status: log.status,
      customer_name: customerMap.get(log.customer_id)?.name || 'Bilinmeyen',
      customer_phone: customerMap.get(log.customer_id)?.phone || '',
      created_at: log.created_at,
      error_message: log.error_message,
    })),
    count: count || 0,
  }
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

export async function getMessageStatsByAllBusinesses(): Promise<Array<{
  business_id: string
  business_name: string
  total: number
  sent: number
  failed: number
  success_rate: number
  last_message_at: string | null
}>> {
  const { data, error } = await supabase.rpc('get_message_stats_by_business')

  if (error) throw error

  return (data || []).map((row: any) => ({
    business_id: row.business_id,
    business_name: row.business_name,
    total: Number(row.total || 0),
    sent: Number(row.sent || 0),
    failed: Number(row.failed || 0),
    success_rate: Number(row.success_rate || 0),
    last_message_at: row.last_message_at,
  }))
}

export async function getRecentMessageLogsWithCustomers(
  businessId: string,
  limit: number = 10
): Promise<Array<MessageLog & { customer_name: string; customer_phone: string }>> {
  const result = await getMessageLogsWithCustomersByBusinessId(businessId, {
    limit,
    offset: 0,
  })

  return result.data.map((log) => ({
    id: log.id,
    business_id: businessId,
    customer_id: log.customer_id,
    status: log.status,
    error_message: log.error_message,
    created_at: log.created_at,
    customer_name: log.customer_name,
    customer_phone: log.customer_phone,
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
    .lt('created_at', endDate)

  if (error) throw error

  const grouped: Record<string, { sent: number; failed: number }> = {}

  data?.forEach((log) => {
    const date = getTimeZoneDateKey(new Date(log.created_at))
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

export async function countMessageLogsByBusinessIdInRange(
  businessId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const { count, error } = await supabase
    .from('message_logs')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('created_at', startDate)
    .lt('created_at', endDate)

  if (error) throw error

  return count || 0
}
