import {
  getBusinessSettings,
  upsertBusinessSettings,
} from '@/lib/db/repositories/business-settings'
import { requireBusinessUser } from '@/lib/auth/guards'
import { assertSameOrigin } from '@/lib/api/request'
import { handleRouteError } from '@/lib/api/errors'
import { z } from 'zod'

const MODULE = 'Business/Settings'
const PATH = '/api/business/settings'

const updateSettingsSchema = z.object({
  review_platform: z.enum(['google', 'tripadvisor', 'custom']).optional(),
  review_url: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) => {
        if (!value || value.trim() === '') {
          return true
        }

        try {
          new URL(value.trim())
          return true
        } catch {
          return false
        }
      },
      { message: 'Gecerli bir URL girin' }
    )
    .transform((value) => (value && value.trim() ? value.trim() : null)),
  message_template: z.string().nullable().optional(),
})

export async function GET() {
  const startTime = Date.now()

  try {
    const user = await requireBusinessUser()
    const settings = await getBusinessSettings(user.businessId)

    return Response.json(settings || null)
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

export async function PUT(request: Request) {
  const startTime = Date.now()

  try {
    assertSameOrigin(request)
    const user = await requireBusinessUser()

    const currentSettings = await getBusinessSettings(user.businessId)
    const body = await request.json()
    const data = updateSettingsSchema.parse(body)

    const settings = await upsertBusinessSettings({
      business_id: user.businessId,
      review_platform:
        data.review_platform ??
        currentSettings?.review_platform ??
        'custom',
      review_url:
        data.review_url !== undefined
          ? data.review_url
          : currentSettings?.review_url ?? null,
      message_template:
        data.message_template !== undefined
          ? data.message_template
          : currentSettings?.message_template ?? null,
    })

    return Response.json(settings)
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
