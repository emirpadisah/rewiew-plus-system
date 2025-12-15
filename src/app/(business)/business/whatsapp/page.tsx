'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface ConnectionStatus {
  status: 'connected' | 'disconnected' | 'pending'
  instanceName: string | null
  lastSeenAt: string | null
}

export default function WhatsAppPage() {
  const { toast } = useToast()
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    fetchStatus()
    // Poll status every 5 seconds if pending
    const interval = setInterval(() => {
      if (status?.status === 'pending') {
        fetchStatus()
        fetchQrCode()
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [status?.status])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/evolution/status')
      const data = await response.json()
      setStatus(data)
      if (data.status === 'pending' && !qrCode) {
        fetchQrCode()
      } else if (data.status === 'connected') {
        setQrCode(null)
      }
    } catch (error) {
      console.error('Error fetching status:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQrCode = async () => {
    try {
      const response = await fetch('/api/evolution/qrcode')
      const data = await response.json()
      
      // Evolution API v2 response format
      // base64 already includes 'data:image/png;base64,' prefix, so use it directly
      
      if (data.base64) {
        setQrCode(data.base64)
      } else if (data.qrcode?.base64) {
        const qrData = data.qrcode.base64.startsWith('data:') ? data.qrcode.base64 : `data:image/png;base64,${data.qrcode.base64}`
        setQrCode(qrData)
      } else if (data.code) {
        setQrCode(data.code)
      }
    } catch (error) {
      console.error('Error fetching QR code:', error)
    }
  }

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const response = await fetch('/api/evolution/create-instance', {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        // If connection exists error, offer to close it
        if (data.error?.includes('already exists') || data.error?.includes('Connection already exists')) {
          const shouldClose = confirm(
            'Mevcut bir bağlantı var. Yeni bağlantı oluşturmak için önce mevcut bağlantıyı kapatmanız gerekiyor. Kapatmak istiyor musunuz?'
          )
          if (shouldClose) {
            setConnecting(false)
            // Close connection first
            try {
              await fetch('/api/evolution/reset', { method: 'POST' })
              setStatus(null)
              setQrCode(null)
              // Wait a bit then retry
              setTimeout(() => {
                handleConnect()
              }, 1000)
            } catch (error) {
              toast({
                title: 'Hata',
                description: 'Bağlantı kapatılırken bir hata oluştu',
                variant: 'destructive',
              })
              setConnecting(false)
            }
            return
          } else {
            setConnecting(false)
            return
          }
        }
        throw new Error(data.error || 'Failed to create instance')
      }

      const data = await response.json()
      toast({
        title: 'Başarılı',
        description: 'WhatsApp bağlantısı başlatıldı',
      })

      // Set QR code from response if available
      if (data.qrcode) {
        if (data.qrcode.base64) {
          setQrCode(`data:image/png;base64,${data.qrcode.base64}`)
        } else if (data.qrcode.code) {
          setQrCode(data.qrcode.code)
        }
      }

      // Fetch status and QR code
      setTimeout(() => {
        fetchStatus()
        if (!data.qrcode) {
          fetchQrCode()
        }
      }, 1000)
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Bağlantı kurulurken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setConnecting(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Bağlantıyı sıfırlamak istediğinize emin misiniz?')) {
      return
    }

    setResetting(true)
    try {
      const response = await fetch('/api/evolution/reset', {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reset connection')
      }

      toast({
        title: 'Başarılı',
        description: 'Bağlantı kapatıldı',
      })

      setStatus(null)
      setQrCode(null)
      // Refresh status after a short delay
      setTimeout(() => {
        fetchStatus()
      }, 500)
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Bağlantı sıfırlanırken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return <div>Yükleniyor...</div>
  }

  const statusText = {
    connected: 'Bağlı',
    disconnected: 'Bağlı Değil',
    pending: 'Beklemede',
  }[status?.status || 'disconnected']

  const statusColor = {
    connected: 'text-green-600',
    disconnected: 'text-red-600',
    pending: 'text-yellow-600',
  }[status?.status || 'disconnected']

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">WhatsApp Bağlantısı</h1>

      <Card>
        <CardHeader>
          <CardTitle>Bağlantı Durumu</CardTitle>
          <CardDescription>WhatsApp bağlantı durumunuz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Durum</div>
            <div className={`text-2xl font-bold ${statusColor}`}>
              {statusText}
            </div>
            {status?.lastSeenAt && (
              <div className="text-sm text-muted-foreground mt-2">
                Son görülme: {new Date(status.lastSeenAt).toLocaleString('tr-TR')}
              </div>
            )}
          </div>

          {status?.status === 'disconnected' && (
            <div className="flex gap-2">
              <Button onClick={handleConnect} disabled={connecting}>
                {connecting ? 'Bağlanıyor...' : 'WhatsApp Bağla'}
              </Button>
              {status.instanceName && (
                <Button 
                  variant="outline" 
                  onClick={handleReset} 
                  disabled={resetting}
                >
                  {resetting ? 'Kapatılıyor...' : 'Bağlantıyı Kapat'}
                </Button>
              )}
            </div>
          )}

          {status?.status === 'pending' && (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">
                  QR Kodu ile Bağlanın
                </div>
                {qrCode ? (
                  qrCode.startsWith('data:image') ? (
                    <div className="flex justify-center">
                      <img 
                        src={qrCode} 
                        alt="QR Code" 
                        className="border rounded-lg max-w-xs w-full h-auto"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4 font-mono text-sm bg-white break-all">
                      {qrCode}
                    </div>
                  )
                ) : (
                  <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    QR kod yükleniyor...
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchQrCode}>
                  QR Kodu Yenile
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReset} 
                  disabled={resetting}
                >
                  {resetting ? 'Kapatılıyor...' : 'Bağlantıyı Kapat'}
                </Button>
              </div>
            </div>
          )}

          {status?.status === 'connected' && (
            <Button variant="destructive" onClick={handleReset} disabled={resetting}>
              {resetting ? 'Sıfırlanıyor...' : 'Bağlantıyı Sıfırla'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

