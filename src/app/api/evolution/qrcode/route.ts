import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getQrCode } from '@/lib/evolution/client'
import { getWhatsAppConnectionByBusinessId } from '@/lib/db/repositories/whatsapp-connections'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'business' || !user.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const connection = await getWhatsAppConnectionByBusinessId(user.businessId)
    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      )
    }

    const qrcode = await getQrCode(connection.instance_name)

    // Evolution API v2 response format normalization
    // Response format: { base64: 'data:image/png;base64,...', code: '...', pairingCode: null, count: 1 }
    // base64 already includes 'data:image/png;base64,' prefix, so use it directly
    let normalizedQrCode = qrcode
    
    if (qrcode.qrcode) {
      // If nested in qrcode property
      normalizedQrCode = qrcode.qrcode
    } else {
      // Use direct properties
      normalizedQrCode = {
        base64: qrcode.base64,
        code: qrcode.code,
        pairingCode: qrcode.pairingCode,
      }
    }

    return NextResponse.json(normalizedQrCode)
  } catch (error: any) {
    console.error('Error fetching QR code:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

