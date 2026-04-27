import { EvolutionSendMessageResponse } from './types'
import { log } from '@/lib/logger'

const MODULE = 'Evolution/WhatsApp'
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080'
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || ''

async function evolutionRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${EVOLUTION_API_URL}${endpoint}`
  const startTime = Date.now()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (EVOLUTION_API_KEY) {
    headers.apikey = EVOLUTION_API_KEY
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const duration = Date.now() - startTime

    if (!response.ok) {
      try {
        await response.json()
      } catch {
        await response.text()
      }

      log.error(MODULE, 'Evolution API request failed', undefined, {
        url,
        endpoint,
        status: response.status,
        method: options.method || 'GET',
        duration,
      })

      throw new Error('Evolution request failed')
    }

    log.debug(MODULE, `${options.method || 'GET'} ${endpoint}`, {
      status: response.status,
      duration,
    })

    return await response.json()
  } catch (error) {
    const duration = Date.now() - startTime

    log.error(MODULE, 'Evolution request failed', error, {
      url,
      endpoint,
      method: options.method || 'GET',
      duration,
    })

    throw new Error('Evolution request failed')
  }
}

export async function createInstance(instanceName: string): Promise<any> {
  log.info(MODULE, 'Creating WhatsApp instance', { instanceName })

  const result = await evolutionRequest<any>('/instance/create', {
    method: 'POST',
    body: JSON.stringify({
      instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
    }),
  })

  log.info(MODULE, 'WhatsApp instance created', { instanceName })
  return result
}

export async function getQrCode(instanceName: string): Promise<any> {
  log.debug(MODULE, 'Fetching QR code', { instanceName })

  const response = await evolutionRequest<any>(`/instance/connect/${instanceName}`, {
    method: 'GET',
  })

  log.info(MODULE, 'QR code fetched', { instanceName })
  return response
}

export async function getConnectionStatus(instanceName: string): Promise<any> {
  try {
    const instances = await evolutionRequest<any>('/instance/fetchInstances', {
      method: 'GET',
    })

    if (Array.isArray(instances)) {
      const found = instances.find(
        (instance: any) =>
          instance.name === instanceName || instance.instanceName === instanceName
      )

      if (!found) {
        return {
          status: 'disconnected',
          instanceName: null,
          lastSeenAt: null,
        }
      }

      const statusMap: Record<string, string> = {
        open: 'connected',
        close: 'disconnected',
        connecting: 'pending',
      }

      return {
        status: statusMap[found.connectionStatus] || 'disconnected',
        instanceName: found.name || found.instanceName,
        lastSeenAt: found.updatedAt || found.lastSeenAt,
      }
    }

    return instances
  } catch (error) {
    log.warn(MODULE, 'Falling back to disconnected status after Evolution error', {
      instanceName,
    })

    return {
      status: 'disconnected',
      instanceName: null,
      lastSeenAt: null,
    }
  }
}

export async function resetInstance(instanceName: string): Promise<void> {
  log.info(MODULE, 'Resetting WhatsApp instance', { instanceName })

  await evolutionRequest(`/instance/delete/${instanceName}`, {
    method: 'DELETE',
  })

  log.info(MODULE, 'WhatsApp instance reset', { instanceName })
}

export async function sendTextMessage(
  instanceName: string,
  number: string,
  text: string
): Promise<EvolutionSendMessageResponse> {
  log.debug(MODULE, 'Sending WhatsApp message', {
    instanceName,
    number,
    textLength: text.length,
  })

  const response = await evolutionRequest<EvolutionSendMessageResponse>(
    `/message/sendText/${instanceName}`,
    {
      method: 'POST',
      body: JSON.stringify({
        number,
        text,
      }),
    }
  )

  log.info(MODULE, 'WhatsApp message sent', {
    instanceName,
    number,
    textLength: text.length,
    responseId: response.key?.id || 'sent',
  })

  return response
}
