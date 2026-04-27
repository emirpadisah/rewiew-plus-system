import { getConnectionStatus } from '@/lib/evolution/client'
import {
  getWhatsAppConnectionByBusinessId,
  updateWhatsAppConnection,
} from '@/lib/db/repositories/whatsapp-connections'
import { requireBusinessUser } from '@/lib/auth/guards'
import { handleRouteError } from '@/lib/api/errors'

const MODULE = 'Evolution/Status'
const PATH = '/api/evolution/status'

export async function GET(request: Request) {
  const startTime = Date.now()

  try {
    const user = await requireBusinessUser()
    const connection = await getWhatsAppConnectionByBusinessId(user.businessId)

    if (!connection) {
      return Response.json({
        status: 'disconnected',
        instanceName: null,
      })
    }

    const evolutionStatus = await getConnectionStatus(connection.instance_name)
    const status = evolutionStatus.status || 'disconnected'

    if (connection.status !== status) {
      await updateWhatsAppConnection(user.businessId, {
        status: status as any,
        last_seen_at: status === 'connected' ? new Date().toISOString() : null,
      })
    }

    return Response.json({
      status,
      instanceName: evolutionStatus.instanceName || connection.instance_name,
      lastSeenAt: evolutionStatus.lastSeenAt || connection.last_seen_at,
    })
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
