import {
  EvolutionInstance,
  EvolutionQrCode,
  EvolutionConnectionStatus,
  EvolutionSendMessageResponse,
} from './types'
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

  // Evolution API v2 uses apikey header (not Authorization)
  if (EVOLUTION_API_KEY) {
    headers['apikey'] = EVOLUTION_API_KEY
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const duration = Date.now() - startTime

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      let errorData: any = null
      
      try {
        errorData = await response.json()
        errorMessage = JSON.stringify(errorData)
        log.error(MODULE, `Evolution API Hatası - ${endpoint}`, new Error(errorMessage), {
          url,
          status: response.status,
          method: options.method || 'GET',
          duration,
          errorData,
        })
      } catch {
        const errorText = await response.text()
        if (errorText) {
          errorMessage = errorText
        }
        log.error(MODULE, `Evolution API Hatası - ${endpoint}`, new Error(errorMessage), {
          url,
          status: response.status,
          method: options.method || 'GET',
          duration,
        })
      }
      throw new Error(`Evolution API error: ${errorMessage}`)
    }

    log.debug(MODULE, `${options.method || 'GET'} ${endpoint}`, { 
      status: response.status,
      duration,
    })

    return await response.json()
  } catch (error: any) {
    const duration = Date.now() - startTime
    log.error(MODULE, `Evolution request başarısız - ${endpoint}`, error, {
      url,
      method: options.method || 'GET',
      duration,
    })
    throw error
  }
}

export async function createInstance(instanceName: string): Promise<any> {
  log.info(MODULE, `WhatsApp instance oluşturuluyor`, { instanceName })
  
  try {
    const result = await evolutionRequest<any>('/instance/create', {
      method: 'POST',
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      }),
    })
    
    log.info(MODULE, `Instance başarıyla oluşturuldu`, { instanceName })
    return result
  } catch (error) {
    log.error(MODULE, `Instance oluşturma başarısız`, error, { instanceName })
    throw error
  }
}

export async function getQrCode(instanceName: string): Promise<any> {
  log.debug(MODULE, `QR kod alınıyor`, { instanceName })
  
  try {
    const response = await evolutionRequest<any>(`/instance/connect/${instanceName}`, {
      method: 'GET',
    })
    
    log.info(MODULE, `QR kod başarıyla alındı`, { instanceName })
    return response
  } catch (error) {
    log.error(MODULE, `QR kod alınırken hata`, error, { instanceName })
    throw error
  }
}

export async function getConnectionStatus(
  instanceName: string
): Promise<any> {
  try {
    log.debug(MODULE, `Bağlantı durumu kontrol ediliyor`, { instanceName })
    
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
        log.warn(MODULE, `Instance bulunamadı`, { instanceName })
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
      
      const status = statusMap[found.connectionStatus] || 'disconnected'
      log.info(MODULE, `Bağlantı durumu alındı`, { 
        instanceName, 
        status,
        connectionStatus: found.connectionStatus,
      })
      
      return {
        status,
        instanceName: found.name || found.instanceName,
        lastSeenAt: found.updatedAt || found.lastSeenAt,
      }
    }
    
    // Handle single instance response
    return instances
  } catch (error) {
    log.error(MODULE, `Bağlantı durumu kontrol edilirken hata`, error, { instanceName })
    // Fallback: return disconnected status
    return {
      status: 'disconnected',
      instanceName: null,
      lastSeenAt: null,
    }
  }
}

export async function resetInstance(instanceName: string): Promise<void> {
  log.info(MODULE, `Instance sıfırlanıyor`, { instanceName })
  
  try {
    await evolutionRequest(`/instance/delete/${instanceName}`, {
      method: 'DELETE',
    })
    
    log.info(MODULE, `Instance başarıyla sıfırlandı`, { instanceName })
  } catch (error) {
    log.error(MODULE, `Instance sıfırlama başarısız`, error, { instanceName })
    throw error
  }
}

export async function sendTextMessage(
  instanceName: string,
  number: string,
  text: string
): Promise<EvolutionSendMessageResponse> {
  try {
    log.debug(MODULE, `Mesaj gönderiliyor`, { 
      instanceName, 
      number,
      textLength: text.length,
    })
    
    // Evolution API v2 format: text property should be directly in body, not nested in textMessage
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
    
    log.info(MODULE, `Mesaj başarıyla gönderildi`, {
      instanceName,
      number,
      textLength: text.length,
      response: response.key?.id || 'sent',
    })
    
    return response
  } catch (error: any) {
    log.error(MODULE, `Mesaj gönderme başarısız`, error, {
      instanceName,
      number,
      textLength: text.length,
      errorMessage: error.message,
    })
    throw error
  }
}

