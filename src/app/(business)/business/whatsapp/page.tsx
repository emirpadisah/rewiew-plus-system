'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { 
  MessageSquare, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  Clock,
  RefreshCw,
  Power,
  PowerOff,
  Loader2,
  AlertCircle
} from 'lucide-react'

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
  }, [])

  useEffect(() => {
    if (status?.status === 'pending') {
      const interval = setInterval(() => {
        fetchStatus()
        fetchQrCode()
      }, 3000)
      return () => clearInterval(interval)
    }
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
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('QR code fetch failed:', errorData)
        return
      }
      
      const data = await response.json()
      
      if (data.error) {
        console.error('QR code error:', data.error)
        return
      }
      
      if (data.base64) {
        const qrData = data.base64.startsWith('data:') 
          ? data.base64 
          : `data:image/png;base64,${data.base64}`
        setQrCode(qrData)
      } 
      else if (data.qrcode?.base64) {
        const qrData = data.qrcode.base64.startsWith('data:') 
          ? data.qrcode.base64 
          : `data:image/png;base64,${data.qrcode.base64}`
        setQrCode(qrData)
      } 
      else if (data.code) {
        setQrCode(data.code)
      }
      else if (data.qrcode?.code) {
        setQrCode(data.qrcode.code)
      }
    } catch (error: any) {
      console.error('Error fetching QR code:', error.message || error)
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
        if (data.error?.includes('already exists') || data.error?.includes('Connection already exists')) {
          const shouldClose = confirm(
            'Mevcut bir bağlantı var. Yeni bağlantı oluşturmak için önce mevcut bağlantıyı kapatmanız gerekiyor. Kapatmak istiyor musunuz?'
          )
          if (shouldClose) {
            setConnecting(false)
            try {
              await fetch('/api/evolution/reset', { method: 'POST' })
              setStatus(null)
              setQrCode(null)
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

      if (data.qrcode) {
        if (data.qrcode.base64) {
          const qrData = data.qrcode.base64.startsWith('data:') 
            ? data.qrcode.base64 
            : `data:image/png;base64,${data.qrcode.base64}`
          setQrCode(qrData)
        } else if (data.qrcode.code) {
          setQrCode(data.qrcode.code)
        }
      } else if (data.base64) {
        const qrData = data.base64.startsWith('data:') 
          ? data.base64 
          : `data:image/png;base64,${data.base64}`
        setQrCode(qrData)
      } else if (data.code) {
        setQrCode(data.code)
      }

      setTimeout(() => {
        fetchStatus()
        if (!data.qrcode && !data.base64 && !data.code) {
          fetchQrCode()
        }
      }, 2000)
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const statusConfig = {
    connected: { 
      text: 'Bağlı', 
      color: 'text-green-600', 
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle2
    },
    disconnected: { 
      text: 'Bağlı Değil', 
      color: 'text-red-600', 
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: XCircle
    },
    pending: { 
      text: 'Beklemede', 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: Clock
    },
  }

  const currentStatus = statusConfig[status?.status || 'disconnected']
  const StatusIcon = currentStatus.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Bağlantısı</h1>
        <p className="text-muted-foreground mt-1">
          WhatsApp hesabınızı bağlayın ve mesaj göndermeye başlayın
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Bağlantı Durumu
            </CardTitle>
            <CardDescription>WhatsApp bağlantı durumunuz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-6 rounded-lg border-2 ${currentStatus.bg} ${currentStatus.border}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Durum</div>
                  <div className={`text-3xl font-bold ${currentStatus.color} flex items-center gap-2`}>
                    <StatusIcon className="h-8 w-8" />
                    {currentStatus.text}
                  </div>
                </div>
              </div>
              {status?.lastSeenAt && (
                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-1">Son Görülme</div>
                  <div className="text-sm font-medium">
                    {new Date(status.lastSeenAt).toLocaleString('tr-TR')}
                  </div>
                </div>
              )}
            </div>

            {status?.status === 'disconnected' && (
              <div className="space-y-2">
                <Button 
                  onClick={handleConnect} 
                  disabled={connecting} 
                  className="w-full gap-2"
                  size="lg"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Bağlanıyor...
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4" />
                      WhatsApp Bağla
                    </>
                  )}
                </Button>
                {status.instanceName && (
                  <Button 
                    variant="outline" 
                    onClick={handleReset} 
                    disabled={resetting}
                    className="w-full gap-2"
                  >
                    {resetting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Kapatılıyor...
                      </>
                    ) : (
                      <>
                        <PowerOff className="h-4 w-4" />
                        Bağlantıyı Kapat
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {status?.status === 'connected' && (
              <Button 
                variant="destructive" 
                onClick={handleReset} 
                disabled={resetting}
                className="w-full gap-2"
                size="lg"
              >
                {resetting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sıfırlanıyor...
                  </>
                ) : (
                  <>
                    <PowerOff className="h-4 w-4" />
                    Bağlantıyı Sıfırla
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* QR Code Card */}
        {status?.status === 'pending' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Kod ile Bağlanın
              </CardTitle>
              <CardDescription>
                Telefonunuzla QR kodu tarayın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrCode ? (
                qrCode.startsWith('data:image') ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-white rounded-lg border-2 border-dashed">
                      <img 
                        src={qrCode} 
                        alt="QR Code" 
                        className="w-full max-w-xs h-auto"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      WhatsApp uygulamanızı açın → Ayarlar → Bağlı Cihazlar → Cihaz Bağla
                    </p>
                  </div>
                ) : (
                  <div className="p-4 border rounded-lg bg-muted font-mono text-sm break-all text-center">
                    {qrCode}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">QR kod yükleniyor...</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchQrCode} className="flex-1 gap-2">
                  <RefreshCw className="h-4 w-4" />
                  QR Kodu Yenile
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReset} 
                  disabled={resetting}
                  className="flex-1 gap-2"
                >
                  {resetting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Kapatılıyor...
                    </>
                  ) : (
                    <>
                      <PowerOff className="h-4 w-4" />
                      Bağlantıyı Kapat
                    </>
                  )}
                </Button>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    QR kod 60 saniye içinde geçersiz olur. Süre dolduğunda "QR Kodu Yenile" butonuna tıklayın.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
