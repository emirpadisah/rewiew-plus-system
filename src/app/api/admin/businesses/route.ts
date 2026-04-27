import { createBusiness, getAllBusinesses } from '@/lib/db/repositories/businesses'
import { createUser, getUserByEmail } from '@/lib/db/repositories/users'
import { hashPassword } from '@/lib/auth/password'
import { requireAdminUser } from '@/lib/auth/guards'
import { ApiError, handleRouteError } from '@/lib/api/errors'
import { assertSameOrigin, normalizeEmail, parseListQuery } from '@/lib/api/request'
import { z } from 'zod'

const MODULE = 'Admin/Businesses'
const PATH = '/api/admin/businesses'

const createBusinessSchema = z
  .object({
    name: z.string().min(1),
    status: z.enum(['active', 'passive']).optional(),
    notes: z.string().optional(),
    userEmail: z.string().email().optional(),
    userPassword: z.string().min(6).optional(),
  })
  .superRefine((value, ctx) => {
    const hasEmail = Boolean(value.userEmail)
    const hasPassword = Boolean(value.userPassword)

    if (hasEmail !== hasPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'User email and password must be provided together',
        path: ['userEmail'],
      })
    }
  })

export async function GET(request: Request) {
  const startTime = Date.now()

  try {
    await requireAdminUser()

    const { search, status, limit, offset } = parseListQuery(request, {
      defaultLimit: 10,
      maxLimit: 100,
      maxSearchLength: 100,
      statusValues: ['active', 'passive'],
    })

    const result = await getAllBusinesses({
      search,
      status: status as 'active' | 'passive' | undefined,
      limit,
      offset,
    })

    return Response.json(result)
  } catch (error) {
    return handleRouteError({
      module: MODULE,
      method: 'GET',
      path: PATH,
      startTime,
      error,
    })
  }
}

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    assertSameOrigin(request)
    await requireAdminUser()

    const body = await request.json()
    const data = createBusinessSchema.parse(body)

    if (data.userEmail) {
      const normalizedEmail = normalizeEmail(data.userEmail)
      const existingUser = await getUserByEmail(normalizedEmail)

      if (existingUser) {
        throw new ApiError(409, 'A user with this email already exists', 'USER_EMAIL_EXISTS')
      }
    }

    const business = await createBusiness({
      name: data.name,
      status: data.status,
      notes: data.notes,
    })

    if (data.userEmail && data.userPassword) {
      const passwordHash = await hashPassword(data.userPassword)

      await createUser({
        email: data.userEmail,
        password_hash: passwordHash,
        role: 'business',
        business_id: business.id,
      })
    }

    return Response.json(
      {
        ...business,
        userCreated: Boolean(data.userEmail && data.userPassword),
      },
      { status: 201 }
    )
  } catch (error) {
    return handleRouteError({
      module: MODULE,
      method: 'POST',
      path: PATH,
      startTime,
      error,
    })
  }
}
