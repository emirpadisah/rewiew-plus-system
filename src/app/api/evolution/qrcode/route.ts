import { getQrCode } from '@/lib/evolution/client'
import { getWhatsAppConnectionByBusinessId } from '@/lib/db/repositories/whatsapp-connections'
import { requireBusinessUser } from '@/lib/auth/guards'
import { ApiError, handleRouteError } from '@/lib/api/errors'

const MODULE = 'Evolution/QrCode'
const PATH = '/api/evolution/qrcode'

function normalizeQrCodeResponse(payload: any) {
  if (payload?.qrcode) {
    return {
      base64: payload.qrcode.base64 || payload.qrcode.code,
      code: payload.qrcode.code,
      pairingCode: payload.qrcode.pairingCode,
    }
  }

  if (payload?.base64) {
    return {
      base64: payload.base64,
      code: payload.code,
      pairingCode: payload.pairingCode,
    }
  }

  if (payload?.code) {
    return {
      code: payload.code,
      base64: payload.base64,
      pairingCode: payload.pairingCode,
    }
  }

  if (typeof payload === 'string') {
    return {
      base64: payload.startsWith('data:') ? payload : `data:image/png;base64,${payload}`,
      code: payload,
    }
  }

  return payload || {}
}

export async function GET(request: Request) {
  const startTime = Date.now()

  try {
    const user = await requireBusinessUser()
    const connection = await getWhatsAppConnectionByBusinessId(user.businessId)

    if (!connection) {
      throw new ApiError(404, 'Connection not found', 'CONNECTION_NOT_FOUND')
    }

    let qrcode: any

    try {
      qrcode = await getQrCode(connection.instance_name)
    } catch (error) {
      throw new ApiError(502, 'Evolution service unavailable', 'EVOLUTION_UNAVAILABLE')
    }

    const normalizedQrCode = normalizeQrCodeResponse(qrcode)

    if (
      normalizedQrCode.base64 &&
      typeof normalizedQrCode.base64 === 'string' &&
      !normalizedQrCode.base64.startsWith('data:')
    ) {
      normalizedQrCode.base64 = `data:image/png;base64,${normalizedQrCode.base64}`
    }

    return Response.json(normalizedQrCode)
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
