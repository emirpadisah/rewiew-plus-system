import {
  getMessageLogsWithCustomersByBusinessId,
} from '@/lib/db/repositories/message-logs'
import { requireBusinessUser } from '@/lib/auth/guards'
import { handleRouteError } from '@/lib/api/errors'
import { parseListQuery } from '@/lib/api/request'

const MODULE = 'Business/Messages'
const PATH = '/api/business/messages'

export async function GET(request: Request) {
  const startTime = Date.now()

  try {
    const user = await requireBusinessUser()
    const { limit, offset, status } = parseListQuery(request, {
      defaultLimit: 20,
      maxLimit: 100,
      statusValues: ['sent', 'failed'],
    })

    const result = await getMessageLogsWithCustomersByBusinessId(user.businessId, {
      status: status as 'sent' | 'failed' | undefined,
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
