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
    
    // Check if QR code is in create response first
    if (instance.qrcode) {
      qrcode = instance.qrcode
    } else if (instance.base64) {
      qrcode = {
        base64: instance.base64.startsWith('data:') ? instance.base64 : `data:image/png;base64,${instance.base64}`,
        code: instance.code,
      }
    }
    
    // If not in create response, try to fetch it
    if (!qrcode) {
      try {
        // Wait a bit longer for instance to be ready in production
        await new Promise(resolve => setTimeout(resolve, 2000))
        const qrResponse = await getQrCode(instanceName)
        
        if (qrResponse) {
          if (qrResponse.qrcode) {
            qrcode = qrResponse.qrcode
          } else if (qrResponse.base64) {
            qrcode = {
              base64: qrResponse.base64.startsWith('data:') ? qrResponse.base64 : `data:image/png;base64,${qrResponse.base64}`,
              code: qrResponse.code,
            }
          } else if (qrResponse.code) {
            qrcode = {
              code: qrResponse.code,
              base64: qrResponse.base64,
            }
          }
        }
      } catch (error: any) {
        // QR code will be fetched later via frontend polling
        console.error('QR code not available immediately, will be fetched via polling:', error.message)
      }
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

