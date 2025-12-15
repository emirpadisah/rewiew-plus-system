import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getUserById, updateUserPassword } from '@/lib/db/repositories/users'
import { hashPassword } from '@/lib/auth/password'
import { z } from 'zod'

const updatePasswordSchema = z.object({
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const targetUser = await getUserById(id)
    
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only allow updating business users
    if (targetUser.role !== 'business') {
      return NextResponse.json(
        { error: 'Can only update business user passwords' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { password } = updatePasswordSchema.parse(body)

    const passwordHash = await hashPassword(password)
    await updateUserPassword(id, passwordHash)

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

