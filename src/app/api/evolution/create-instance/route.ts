import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { createInstance, getQrCode } from '@/lib/evolution/client'
import {
  createWhatsAppConnection,
  getWhatsAppConnectionByBusinessId,
} from '@/lib/db/repositories/whatsapp-connections'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'business' || !user.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if connection already exists
    const existing = await getWhatsAppConnectionByBusinessId(user.businessId)
    if (existing) {
      return NextResponse.json(
        { error: 'Connection already exists' },
        { status: 400 }
      )
    }

    const instanceName = `business_${user.businessId.replace(/-/g, '_')}`

    // Create instance in Evolution API
    const instance = await createInstance(instanceName)

    // Save to database
    await createWhatsAppConnection({
      business_id: user.businessId,
      instance_name: instanceName,
      status: 'pending',
    })

    // Evolution API v2: QR code might not be in create response
    // Need to fetch it separately via connect endpoint
    let qrcode = null
    try {
      // Try to get QR code immediately after creation
      await new Promise(resolve => setTimeout(resolve, 500)) // Small delay for instance to be ready
      const qrResponse = await getQrCode(instanceName)
      if (qrResponse) {
        qrcode = qrResponse.qrcode || qrResponse.qrCode || {
          base64: qrResponse.base64,
          code: qrResponse.code,
        }
      }
    } catch (error) {
      // QR code will be fetched later via frontend polling
    }

    // If QR code in create response, use it
    if (!qrcode && instance.qrcode) {
      qrcode = instance.qrcode
    }

    return NextResponse.json({ 
      instanceName, 
      qrcode
    })
  } catch (error: any) {
    console.error('Error creating instance:', error.message)
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: error.message?.includes('Evolution API') ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

