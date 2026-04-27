import { supabase } from '../supabase'
import { Business, BusinessPackage, BusinessStatus } from '@/types'

export async function createBusiness(data: {
  name: string
  status?: BusinessStatus
  notes?: string
}): Promise<Business> {
  const { data: business, error } = await supabase
    .from('businesses')
    .insert({
      name: data.name,
      status: data.status || 'active',
      notes: data.notes || null,
    })
    .select()
    .single()

  if (error) throw error
  return business
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function getAllBusinesses(params?: {
  search?: string
  status?: BusinessStatus
  limit?: number
  offset?: number
}): Promise<{ data: Business[]; count: number }> {
  let query = supabase.from('businesses').select('*', { count: 'exact' })

  if (params?.search) {
    query = query.ilike('name', `%${params.search}%`)
  }

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

export async function updateBusiness(
  id: string,
  updates: {
    name?: string
    status?: BusinessStatus
    package_tier?: BusinessPackage | null
    last_payment_at?: string | null
    next_renewal_at?: string | null
    notes?: string | null
  }
): Promise<Business> {
  const { data, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getRecentBusinesses(limit: number = 5): Promise<Business[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function getBusinessStats(): Promise<{
  total: number
  active: number
  passive: number
}> {
  const { count: total, error: totalError } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })

  if (totalError) throw totalError

  const { count: active, error: activeError } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  if (activeError) throw activeError

  const { count: passive, error: passiveError } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'passive')

  if (passiveError) throw passiveError

  return {
    total: total || 0,
    active: active || 0,
    passive: passive || 0,
  }
}

