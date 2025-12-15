import { supabase } from '../supabase'
import { BusinessSettings, ReviewPlatform } from '@/types'

export async function getBusinessSettings(
  businessId: string
): Promise<BusinessSettings | null> {
  const { data, error } = await supabase
    .from('business_settings')
    .select('*')
    .eq('business_id', businessId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function upsertBusinessSettings(data: {
  business_id: string
  review_platform: ReviewPlatform
  review_url?: string | null
  message_template?: string | null
}): Promise<BusinessSettings> {
  const { data: settings, error } = await supabase
    .from('business_settings')
    .upsert(
      {
        business_id: data.business_id,
        review_platform: data.review_platform,
        review_url: data.review_url || null,
        message_template: data.message_template || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'business_id',
      }
    )
    .select()
    .single()

  if (error) throw error
  return settings
}

