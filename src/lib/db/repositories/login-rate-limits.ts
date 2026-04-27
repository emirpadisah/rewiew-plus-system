import { supabase } from '../supabase'

export interface LoginRateLimitRecord {
  normalized_email: string
  ip_address: string
  failed_attempts: number
  window_started_at: string
  last_attempt_at: string
  blocked_until: string | null
}

export async function getLoginRateLimitRecord(
  normalizedEmail: string,
  ipAddress: string
): Promise<LoginRateLimitRecord | null> {
  const { data, error } = await supabase
    .from('login_rate_limits')
    .select(
      'normalized_email, ip_address, failed_attempts, window_started_at, last_attempt_at, blocked_until'
    )
    .eq('normalized_email', normalizedEmail)
    .eq('ip_address', ipAddress)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function upsertLoginRateLimitRecord(
  record: LoginRateLimitRecord
): Promise<LoginRateLimitRecord> {
  const { data, error } = await supabase
    .from('login_rate_limits')
    .upsert(record, { onConflict: 'normalized_email,ip_address' })
    .select(
      'normalized_email, ip_address, failed_attempts, window_started_at, last_attempt_at, blocked_until'
    )
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function clearLoginRateLimitRecord(
  normalizedEmail: string,
  ipAddress: string
): Promise<void> {
  const { error } = await supabase
    .from('login_rate_limits')
    .delete()
    .eq('normalized_email', normalizedEmail)
    .eq('ip_address', ipAddress)

  if (error) {
    throw error
  }
}
