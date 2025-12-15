import { supabase } from '../supabase'
import { User, UserRole } from '@/types'

export async function createUser(data: {
  email: string
  password_hash: string
  role: UserRole
  business_id?: string | null
}): Promise<User> {
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: data.email,
      password_hash: data.password_hash,
      role: data.role,
      business_id: data.business_id || null,
    })
    .select()
    .single()

  if (error) throw error
  return user
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function getUsersByBusinessId(businessId: string): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('business_id', businessId)

  if (error) throw error
  return data || []
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

