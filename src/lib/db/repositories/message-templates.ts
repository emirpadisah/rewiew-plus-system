import { supabase } from '../supabase'
import { MessageTemplate } from '@/types'

export async function getMessageTemplatesByBusinessId(
  businessId: string
): Promise<MessageTemplate[]> {
  const { data, error } = await supabase
    .from('message_templates')
    .select('*')
    .eq('business_id', businessId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getMessageTemplateById(
  id: string
): Promise<MessageTemplate | null> {
  const { data, error } = await supabase
    .from('message_templates')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function createMessageTemplate(data: {
  business_id: string
  name: string
  template: string
  is_default?: boolean
}): Promise<MessageTemplate> {
  // If this is set as default, unset other defaults
  if (data.is_default) {
    await supabase
      .from('message_templates')
      .update({ is_default: false })
      .eq('business_id', data.business_id)
      .eq('is_default', true)
  }

  const { data: template, error } = await supabase
    .from('message_templates')
    .insert({
      business_id: data.business_id,
      name: data.name,
      template: data.template,
      is_default: data.is_default || false,
    })
    .select()
    .single()

  if (error) throw error
  return template
}

export async function updateMessageTemplate(
  id: string,
  updates: {
    name?: string
    template?: string
    is_default?: boolean
  }
): Promise<MessageTemplate> {
  // If setting as default, unset other defaults
  if (updates.is_default) {
    const template = await getMessageTemplateById(id)
    if (template) {
      await supabase
        .from('message_templates')
        .update({ is_default: false })
        .eq('business_id', template.business_id)
        .eq('is_default', true)
        .neq('id', id)
    }
  }

  const { data, error } = await supabase
    .from('message_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMessageTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('message_templates')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getDefaultMessageTemplate(
  businessId: string
): Promise<MessageTemplate | null> {
  const { data, error } = await supabase
    .from('message_templates')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_default', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

