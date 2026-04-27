import {
  createMessageTemplate,
  getMessageTemplatesByBusinessId,
} from '@/lib/db/repositories/message-templates'
import { requireBusinessUser } from '@/lib/auth/guards'
import { assertSameOrigin } from '@/lib/api/request'
import { handleRouteError } from '@/lib/api/errors'
import { z } from 'zod'

const MODULE = 'Business/MessageTemplates'
const PATH = '/api/business/message-templates'

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  template: z.string().min(1, 'Template content is required'),
  is_default: z.boolean().optional(),
})

export async function GET() {
  const startTime = Date.now()

  try {
    const user = await requireBusinessUser()
    const templates = await getMessageTemplatesByBusinessId(user.businessId)

    return Response.json({ templates })
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
    const user = await requireBusinessUser()

    const body = await request.json()
    const data = createTemplateSchema.parse(body)

    const template = await createMessageTemplate({
      ...data,
      business_id: user.businessId,
    })

    return Response.json(template, { status: 201 })
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
