import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getConnectionStatus } from '@/lib/evolution/client'
import {
  getWhatsAppConnectionByBusinessId,
  updateWhatsAppConnection,
} from '@/lib/db/repositories/whatsapp-connections'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'business' || !user.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const connection = await getWhatsAppConnectionByBusinessId(user.businessId)
    if (!connection) {
      return NextResponse.json({
        status: 'disconnected',
        instanceName: null,
      })
    }

    // Get status from Evolution API
    const evolutionStatus = await getConnectionStatus(connection.instance_name)
    
    // evolutionStatus already mapped to our format in client.ts
    const status = evolutionStatus.status || 'disconnected'

    // Update database if status changed
    if (connection.status !== status) {
      await updateWhatsAppConnection(user.businessId, {
        status: status as any,
        last_seen_at:
          status === 'connected' ? new Date().toISOString() : null,
      })
    }

    return NextResponse.json({
      status,
      instanceName: evolutionStatus.instanceName || connection.instance_name,
      lastSeenAt: evolutionStatus.lastSeenAt || connection.last_seen_at,
    })
  } catch (error: any) {
    console.error('Error fetching status:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

