import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getBusinessById } from '@/lib/db/repositories/businesses'
import { getUsersByBusinessId } from '@/lib/db/repositories/users'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const business = await getBusinessById(id)
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const users = await getUsersByBusinessId(id)

    return NextResponse.json({
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        business_id: u.business_id,
        created_at: u.created_at,
      })),
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
