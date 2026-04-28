import { supabase } from '../supabase'
import { Customer } from '@/types'
import { escapeLikePattern, normalizeSearchTerm } from '@/lib/api/request'

export async function createCustomer(data: {
  business_id: string
  name: string
  phone: string // E.164 format
}): Promise<Customer> {
  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      business_id: data.business_id,
      name: data.name,
      phone: data.phone,
    })
    .select()
    .single()

  if (error) throw error
  return customer
}

export async function createCustomersBulk(
  customers: Array<{ business_id: string; name: string; phone: string }>
): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .insert(customers)
    .select()

  if (error) throw error
  return data || []
}

export async function countCustomersByBusinessId(businessId: string): Promise<number> {
  const { count, error } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)

  if (error) throw error
  return count || 0
}

export async function getCustomersByBusinessId(
  businessId: string,
  params?: {
    search?: string
    limit?: number
    offset?: number
  }
): Promise<{ data: Customer[]; count: number }> {
  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .eq('business_id', businessId)

  if (params?.search) {
    const normalizedSearch = normalizeSearchTerm(params.search)

    if (normalizedSearch) {
      const escapedSearch = escapeLikePattern(normalizedSearch)
      query = query.or(`name.ilike.%${escapedSearch}%,phone.ilike.%${escapedSearch}%`)
    }
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

export async function getCustomersByBusinessIdAndIds(
  businessId: string,
  customerIds: string[]
): Promise<Customer[]> {
  if (customerIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .in('id', customerIds)

  if (error) throw error
  return data || []
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function updateCustomerLastMessageAt(
  customerId: string
): Promise<void> {
  const { error } = await supabase
    .from('customers')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', customerId)

  if (error) throw error
}

export async function updateCustomer(
  customerId: string,
  updates: {
    notes?: string | null
    category?: string | null
  }
): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', customerId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCustomersCategory(
  businessId: string,
  customerIds: string[],
  category: string | null
): Promise<Customer[]> {
  if (customerIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('customers')
    .update({ category })
    .eq('business_id', businessId)
    .in('id', customerIds)
    .select()

  if (error) throw error
  return data || []
}

export async function deleteCustomersByBusinessId(
  businessId: string,
  customerIds: string[]
): Promise<number> {
  if (customerIds.length === 0) {
    return 0
  }

  const { data, error } = await supabase
    .from('customers')
    .delete()
    .eq('business_id', businessId)
    .in('id', customerIds)
    .select('id')

  if (error) throw error
  return data?.length || 0
}

