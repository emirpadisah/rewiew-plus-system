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
    // Handle various response formats
    let normalizedQrCode: any = {}
    
    // Check for nested qrcode object
    if (qrcode.qrcode) {
      normalizedQrCode = {
        base64: qrcode.qrcode.base64 || qrcode.qrcode.code,
        code: qrcode.qrcode.code,
        pairingCode: qrcode.qrcode.pairingCode,
      }
    } 
    // Check for direct base64 property
    else if (qrcode.base64) {
      normalizedQrCode = {
        base64: qrcode.base64,
        code: qrcode.code,
        pairingCode: qrcode.pairingCode,
      }
    }
    // Check for code property (text QR code)
    else if (qrcode.code) {
      normalizedQrCode = {
        code: qrcode.code,
        base64: qrcode.base64,
        pairingCode: qrcode.pairingCode,
      }
    }
    // If response is a string (direct QR code data)
    else if (typeof qrcode === 'string') {
      normalizedQrCode = {
        base64: qrcode.startsWith('data:') ? qrcode : `data:image/png;base64,${qrcode}`,
        code: qrcode,
      }
    }
    // Fallback: return as-is
    else {
      normalizedQrCode = qrcode
    }

    // Ensure base64 has proper prefix if it exists
    if (normalizedQrCode.base64 && !normalizedQrCode.base64.startsWith('data:')) {
      normalizedQrCode.base64 = `data:image/png;base64,${normalizedQrCode.base64}`
    }

    return NextResponse.json(normalizedQrCode)
  } catch (error: any) {
    console.error('Error fetching QR code:', {
      error: error.message,
      stack: error.stack,
      details: error,
    })
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

