export interface EvolutionInstance {
  instanceName: string
  token?: string
  qrcode?: {
    code?: string
    base64?: string
  }
  status?: 'open' | 'close' | 'connecting'
}

export interface EvolutionQrCode {
  code?: string
  base64?: string
}

export interface EvolutionConnectionStatus {
  instance: {
    instanceName: string
    status: 'open' | 'close' | 'connecting'
    state?: string
  }
}

export interface EvolutionSendMessageResponse {
  key: {
    remoteJid: string
    id: string
  }
  message: {
    conversation?: string
  }
  messageTimestamp: number
  status: 'PENDING' | 'SERVER_ACK' | 'DELIVERY_ACK' | 'READ' | 'ERROR'
}

