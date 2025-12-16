import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import {
  getBusinessSettings,
  upsertBusinessSettings,
} from '@/lib/db/repositories/business-settings'
import { z } from 'zod'

const updateSettingsSchema = z.object({
  review_platform: z.enum(['google', 'tripadvisor', 'custom']).optional(),
  review_url: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true // Allow empty string
        try {
          new URL(val.trim())
          return true
        } catch {
          return false
        }
      },
      { message: 'Geçerli bir URL girin' }
    )
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  message_template: z.string().nullable().optional(),
})

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'business' || !user.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await getBusinessSettings(user.businessId)
    return NextResponse.json(settings || null)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'business' || !user.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = updateSettingsSchema.parse(body)

    const settings = await upsertBusinessSettings({
      business_id: user.businessId,
      review_platform: data.review_platform || 'custom',
      review_url: data.review_url || null,
      message_template: data.message_template || null,
    })

    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

