import { createInstance, getQrCode } from '@/lib/evolution/client'
import {
  createWhatsAppConnection,
  getWhatsAppConnectionByBusinessId,
} from '@/lib/db/repositories/whatsapp-connections'
import { requireBusinessUser } from '@/lib/auth/guards'
import { ApiError, handleRouteError } from '@/lib/api/errors'
import { assertSameOrigin } from '@/lib/api/request'
import { log } from '@/lib/logger'

const MODULE = 'Evolution/CreateInstance'
const PATH = '/api/evolution/create-instance'

function normalizeQrCodeResponse(payload: any) {
  if (!payload) {
    return null
  }

  if (payload.qrcode) {
    return payload.qrcode
  }

  if (payload.base64) {
    return {
      base64: payload.base64.startsWith('data:')
        ? payload.base64
        : `data:image/png;base64,${payload.base64}`,
      code: payload.code,
    }
  }

  if (payload.code) {
    return {
      code: payload.code,
      base64: payload.base64,
    }
  }

  return payload
}

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    assertSameOrigin(request)
    const user = await requireBusinessUser()

    const existing = await getWhatsAppConnectionByBusinessId(user.businessId)
    if (existing) {
      throw new ApiError(400, 'Connection already exists', 'CONNECTION_ALREADY_EXISTS')
    }

    const instanceName = `business_${user.businessId.replace(/-/g, '_')}`

    let instance: any
    try {
      instance = await createInstance(instanceName)
    } catch (error) {
      throw new ApiError(502, 'Evolution service unavailable', 'EVOLUTION_UNAVAILABLE')
    }

    await createWhatsAppConnection({
      business_id: user.businessId,
      instance_name: instanceName,
      status: 'pending',
    })

    let qrcode = normalizeQrCodeResponse(instance)

    if (!qrcode) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        qrcode = normalizeQrCodeResponse(await getQrCode(instanceName))
      } catch (error) {
        log.warn(MODULE, 'QR code not ready yet; frontend can continue polling', {
          businessId: user.businessId,
          instanceName,
        })
      }
    }

    log.api(MODULE, 'POST', PATH, 200, Date.now() - startTime)

    return Response.json({
      instanceName,
      qrcode,
    })
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
