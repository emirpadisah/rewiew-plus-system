import {
  deleteMessageTemplate,
  getMessageTemplateById,
  updateMessageTemplate,
} from '@/lib/db/repositories/message-templates'
import { requireBusinessUser } from '@/lib/auth/guards'
import { ApiError, handleRouteError } from '@/lib/api/errors'
import { assertSameOrigin } from '@/lib/api/request'
import { z } from 'zod'

const MODULE = 'Business/MessageTemplateDetail'
const PATH = '/api/business/message-templates/[id]'

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  template: z.string().min(1).optional(),
  is_default: z.boolean().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  try {
    const user = await requireBusinessUser()
    const { id } = await params
    const template = await getMessageTemplateById(id)

    if (!template || template.business_id !== user.businessId) {
      throw new ApiError(404, 'Template not found', 'TEMPLATE_NOT_FOUND')
    }

    return Response.json(template)
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  try {
    assertSameOrigin(request)
    const user = await requireBusinessUser()

    const { id } = await params
    const body = await request.json()
    const data = updateTemplateSchema.parse(body)

    const template = await getMessageTemplateById(id)
    if (!template || template.business_id !== user.businessId) {
      throw new ApiError(404, 'Template not found', 'TEMPLATE_NOT_FOUND')
    }

    const updated = await updateMessageTemplate(id, data)
    return Response.json(updated)
  } catch (error) {
    return handleRouteError({
      module: MODULE,
      method: 'PATCH',
      path: PATH,
      startTime,
      error,
    })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  try {
    assertSameOrigin(request)
    const user = await requireBusinessUser()

    const { id } = await params
    const template = await getMessageTemplateById(id)

    if (!template || template.business_id !== user.businessId) {
      throw new ApiError(404, 'Template not found', 'TEMPLATE_NOT_FOUND')
    }

    await deleteMessageTemplate(id)
    return Response.json({ success: true })
  } catch (error) {
    return handleRouteError({
      module: MODULE,
      method: 'DELETE',
      path: PATH,
      startTime,
      error,
    })
  }
}
