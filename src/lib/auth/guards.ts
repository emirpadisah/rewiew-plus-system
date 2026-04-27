import { ApiError } from '@/lib/api/errors'
import { getCurrentUser } from '@/lib/auth/get-current-user'

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser()

  if (!user) {
    throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED')
  }

  return user
}

export async function requireAdminUser() {
  const user = await requireAuthenticatedUser()

  if (user.role !== 'admin') {
    throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED')
  }

  return user
}

export async function requireBusinessUser() {
  const user = await requireAuthenticatedUser()

  if (user.role !== 'business' || !user.businessId) {
    throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED')
  }

  return {
    ...user,
    businessId: user.businessId,
  }
}
