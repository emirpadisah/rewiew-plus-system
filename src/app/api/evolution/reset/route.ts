import { resetInstance } from '@/lib/evolution/client'
import {
  deleteWhatsAppConnection,
  getWhatsAppConnectionByBusinessId,
} from '@/lib/db/repositories/whatsapp-connections'
import { requireBusinessUser } from '@/lib/auth/guards'
import { ApiError, handleRouteError } from '@/lib/api/errors'
import { assertSameOrigin } from '@/lib/api/request'

const MODULE = 'Evolution/Reset'
const PATH = '/api/evolution/reset'

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    assertSameOrigin(request)
    const user = await requireBusinessUser()

    const connection = await getWhatsAppConnectionByBusinessId(user.businessId)
    if (!connection) {
      throw new ApiError(404, 'Connection not found', 'CONNECTION_NOT_FOUND')
    }

    try {
      await resetInstance(connection.instance_name)
    } catch (error) {
      throw new ApiError(502, 'Evolution service unavailable', 'EVOLUTION_UNAVAILABLE')
    }

    await deleteWhatsAppConnection(user.businessId)
    return Response.json({ success: true })
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
