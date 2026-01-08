export type UserRole = 'admin' | 'business'

export type BusinessStatus = 'active' | 'passive'

export type WhatsAppConnectionStatus = 'connected' | 'disconnected' | 'pending'

export type MessageLogStatus = 'sent' | 'failed'

export type ReviewPlatform = 'google' | 'tripadvisor' | 'custom'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  businessId?: string
}

export interface Business {
  id: string
  name: string
  status: BusinessStatus
  created_at: string
  last_payment_at: string | null
  next_renewal_at: string | null
  notes: string | null
}

export interface User {
  id: string
  email: string
  password_hash: string
  role: UserRole
  business_id: string | null
  created_at: string
}

export interface Customer {
  id: string
  business_id: string
  name: string
  phone: string // E.164 format
  notes: string | null
  category: string | null
  created_at: string
  last_message_at: string | null
}

export interface WhatsAppConnection {
  id: string
  business_id: string
  instance_name: string
  status: WhatsAppConnectionStatus
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

export interface MessageLog {
  id: string
  business_id: string
  customer_id: string
  status: MessageLogStatus
  error_message: string | null
  created_at: string
}

export interface BusinessSettings {
  business_id: string
  review_platform: ReviewPlatform
  review_url: string | null
  message_template: string | null
}

export interface MessageTemplate {
  id: string
  business_id: string
  name: string
  template: string
  is_default: boolean
  created_at: string
  updated_at: string
}

