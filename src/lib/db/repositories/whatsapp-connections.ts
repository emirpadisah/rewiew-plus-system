import { supabase } from '../supabase'
import { WhatsAppConnection, WhatsAppConnectionStatus } from '@/types'

export async function createWhatsAppConnection(data: {
  business_id: string
  instance_name: string
  status?: WhatsAppConnectionStatus
}): Promise<WhatsAppConnection> {
  const { data: connection, error } = await supabase
    .from('whatsapp_connections')
    .insert({
      business_id: data.business_id,
      instance_name: data.instance_name,
      status: data.status || 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return connection
}

export async function getWhatsAppConnectionByBusinessId(
  businessId: string
): Promise<WhatsAppConnection | null> {
  const { data, error } = await supabase
    .from('whatsapp_connections')
    .select('*')
    .eq('business_id', businessId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function updateWhatsAppConnection(
  businessId: string,
  updates: {
    status?: WhatsAppConnectionStatus
    last_seen_at?: string | null
    instance_name?: string
  }
): Promise<WhatsAppConnection> {
  const { data, error } = await supabase
    .from('whatsapp_connections')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('business_id', businessId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteWhatsAppConnection(
  businessId: string
): Promise<void> {
  const { error } = await supabase
    .from('whatsapp_connections')
    .delete()
    .eq('business_id', businessId)

  if (error) throw error
}

