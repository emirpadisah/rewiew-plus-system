import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { resetInstance } from '@/lib/evolution/client'
import {
  getWhatsAppConnectionByBusinessId,
  deleteWhatsAppConnection,
} from '@/lib/db/repositories/whatsapp-connections'

export async function POST(request: Request) {
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

    // Reset instance in Evolution API
    await resetInstance(connection.instance_name)

    // Delete from database
    await deleteWhatsAppConnection(user.businessId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error resetting connection:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

