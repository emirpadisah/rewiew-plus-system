import { deleteAuthCookie } from '@/lib/auth/cookies'
import { assertSameOrigin } from '@/lib/api/request'
import { handleRouteError } from '@/lib/api/errors'
import { log } from '@/lib/logger'

const MODULE = 'Auth/Logout'
const PATH = '/api/auth/logout'

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    assertSameOrigin(request)
    await deleteAuthCookie()

    log.auth(MODULE, 'Logout completed')
    log.api(MODULE, 'POST', PATH, 200, Date.now() - startTime)

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
