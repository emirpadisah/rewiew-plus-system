import { supabase } from '../supabase'
import { Customer } from '@/types'

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
    query = query.or(`name.ilike.%${params.search}%,phone.ilike.%${params.search}%`)
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

