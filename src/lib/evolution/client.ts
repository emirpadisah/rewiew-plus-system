import {
  EvolutionInstance,
  EvolutionQrCode,
  EvolutionConnectionStatus,
  EvolutionSendMessageResponse,
} from './types'

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080'
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || ''

async function evolutionRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${EVOLUTION_API_URL}${endpoint}`
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Evolution API v2 uses apikey header (not Authorization)
  if (EVOLUTION_API_KEY) {
    headers['apikey'] = EVOLUTION_API_KEY
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    let errorData: any = null
    
    try {
      errorData = await response.json()
      errorMessage = JSON.stringify(errorData)
      console.error('Evolution API Error Response:', {
        url,
        status: response.status,
        errorData,
      })
    } catch {
      const errorText = await response.text()
      if (errorText) {
        errorMessage = errorText
        console.error('Evolution API Error Text:', {
          url,
          status: response.status,
          errorText,
        })
      }
    }
    throw new Error(`Evolution API error: ${errorMessage}`)
  }

  return await response.json()
}

export async function createInstance(instanceName: string): Promise<any> {
  // Evolution API v2.3.7 format
  // According to Postman collection, the correct format is:
  // {
  //   "instanceName": "instance",
  //   "qrcode": true,
  //   "integration": "WHATSAPP-BAILEYS"
  // }
  // Note: token parameter is NOT needed
  return await evolutionRequest<any>('/instance/create', {
    method: 'POST',
    body: JSON.stringify({
      instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
    }),
  })
}

export async function getQrCode(instanceName: string): Promise<any> {
  // Evolution API v2: QR code endpoint
  // According to v2 docs, use /instance/connect/{instanceName}
  // This endpoint returns QR code data
  const response = await evolutionRequest<any>(`/instance/connect/${instanceName}`, {
    method: 'GET',
  })
  
  // Evolution API v2 response format can be:
  // { qrcode: { base64: "...", code: "..." } }
  // or { base64: "...", code: "..." }
  // or direct QR code object
  return response
}

export async function getConnectionStatus(
  instanceName: string
): Promise<any> {
  try {
    // Evolution API v2: fetch all instances
    const instances = await evolutionRequest<any>(`/instance/fetchInstances`, {
      method: 'GET',
    })
    
    // Handle array response (v2 format)
    if (Array.isArray(instances)) {
      const found = instances.find((inst: any) => 
        inst.name === instanceName || 
        inst.instanceName === instanceName
      )
      
      if (!found) {
        return {
          status: 'disconnected',
          instanceName: null,
          lastSeenAt: null,
        }
      }
      
      // Map v2 response format to our expected format
      const statusMap: Record<string, string> = {
        'open': 'connected',
        'close': 'disconnected',
        'connecting': 'pending',
      }
      
      return {
        status: statusMap[found.connectionStatus] || 'disconnected',
        instanceName: found.name || found.instanceName,
        lastSeenAt: found.updatedAt || found.lastSeenAt,
      }
    }
    
    // Handle single instance response
    return instances
  } catch (error) {
    console.error('Error fetching connection status:', error)
    // Fallback: return disconnected status
    return {
      status: 'disconnected',
      instanceName: null,
      lastSeenAt: null,
    }
  }
}

export async function resetInstance(instanceName: string): Promise<void> {
  await evolutionRequest(`/instance/delete/${instanceName}`, {
    method: 'DELETE',
  })
}

export async function sendTextMessage(
  instanceName: string,
  number: string,
  text: string
): Promise<EvolutionSendMessageResponse> {
  try {
    // Evolution API v2 format: text property should be directly in body, not nested in textMessage
    return await evolutionRequest<EvolutionSendMessageResponse>(
      `/message/sendText/${instanceName}`,
      {
        method: 'POST',
        body: JSON.stringify({
          number,
          text,
        }),
      }
    )
  } catch (error: any) {
    console.error('Error sending text message:', {
      instanceName,
      number,
      error: error.message,
    })
    throw error
  }
}

