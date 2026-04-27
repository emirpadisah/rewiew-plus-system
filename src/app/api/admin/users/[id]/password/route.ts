import { getUserById, updateUserPassword } from '@/lib/db/repositories/users'
import { hashPassword } from '@/lib/auth/password'
import { requireAdminUser } from '@/lib/auth/guards'
import { ApiError, handleRouteError } from '@/lib/api/errors'
import { assertSameOrigin } from '@/lib/api/request'
import { z } from 'zod'

const MODULE = 'Admin/UserPassword'
const PATH = '/api/admin/users/[id]/password'

const updatePasswordSchema = z.object({
  password: z.string().min(6, 'Sifre en az 6 karakter olmali'),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  try {
    assertSameOrigin(request)
    await requireAdminUser()

    const { id } = await params
    const targetUser = await getUserById(id)

    if (!targetUser) {
      throw new ApiError(404, 'User not found', 'USER_NOT_FOUND')
    }

    if (targetUser.role !== 'business') {
      throw new ApiError(403, 'Can only update business user passwords', 'INVALID_TARGET_USER')
    }

    const body = await request.json()
    const { password } = updatePasswordSchema.parse(body)

    const passwordHash = await hashPassword(password)
    await updateUserPassword(id, passwordHash)

    return Response.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    return handleRouteError({
      module: MODULE,
      method: 'PUT',
      path: PATH,
      startTime,
      error,
    })
  }
}
