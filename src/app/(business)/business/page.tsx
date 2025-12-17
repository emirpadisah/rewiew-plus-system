'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Users, 
  TrendingUp,
  Clock,
  Send,
  Loader2
} from 'lucide-react'

interface Stats {
  messages: {
    total: number
    sent: number
    failed: number
    successRate: number
    today: {
      sent: number
      failed: number
    }
  }
  whatsapp: {
    status: string
    lastSeenAt: string | null
  }
  customers: {
    total: number
  }
  recentLogs: Array<{
    id: string
    status: 'sent' | 'failed'
    customer_name: string
    customer_phone: string
    created_at: string
    error_message: string | null
  }>
  dailyStats: Array<{
    date: string
    sent: number
    failed: number
  }>
}

export default function BusinessDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/business/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
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

  const whatsappStatusConfig = {
    connected: { 
      text: 'Bağlı', 
      color: 'text-green-600', 
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    disconnected: { 
      text: 'Bağlı Değil', 
      color: 'text-red-600', 
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    pending: { 
      text: 'Beklemede', 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50',
      border: 'border-yellow-200'
    },
  }

  const status = whatsappStatusConfig[stats?.whatsapp.status as keyof typeof whatsappStatusConfig] || whatsappStatusConfig.disconnected

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            İşletmenizin genel durumu ve istatistikleri
          </p>
        </div>
        <Link href="/business/send-message">
          <Button className="w-full sm:w-auto gap-2">
            <Send className="h-4 w-4" />
            Mesaj Gönder
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Mesaj
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.messages.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tüm zamanlar
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Başarılı Mesaj
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats?.messages.sent || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Başarı oranı: {stats?.messages.successRate || 0}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bugün
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.messages.today.sent || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Başarısız: {stats?.messages.today.failed || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Müşteriler
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.customers.total || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Toplam müşteri sayısı
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* WhatsApp Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              WhatsApp Bağlantı Durumu
            </CardTitle>
            <CardDescription>Mevcut bağlantı bilgileri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${status.bg} ${status.border}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Durum</div>
                  <div className={`text-2xl font-bold ${status.color}`}>
                    {status.text}
                  </div>
                </div>
                <div className={`h-3 w-3 rounded-full ${status.color.replace('text-', 'bg-')}`} />
              </div>
            </div>
            {stats?.whatsapp.lastSeenAt && (
              <div className="text-sm">
                <span className="text-muted-foreground">Son Görülme: </span>
                <span className="font-medium">
                  {new Date(stats.whatsapp.lastSeenAt).toLocaleString('tr-TR')}
                </span>
              </div>
            )}
            <Link href="/business/whatsapp">
              <Button variant="outline" className="w-full gap-2">
                <MessageSquare className="h-4 w-4" />
                Bağlantıyı Yönet
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Success Rate Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Başarı Oranı
            </CardTitle>
            <CardDescription>Mesaj gönderme performansı</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-muted-foreground">Başarı Oranı</span>
                <span className="text-3xl font-bold text-green-600">
                  {stats?.messages.successRate || 0}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats?.messages.successRate || 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="text-xs text-muted-foreground mb-1">Başarılı</div>
                <div className="text-xl font-bold text-green-600">
                  {stats?.messages.sent || 0}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="text-xs text-muted-foreground mb-1">Başarısız</div>
                <div className="text-xl font-bold text-red-600">
                  {stats?.messages.failed || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Son Mesajlar</CardTitle>
              <CardDescription>Son gönderilen mesajların listesi</CardDescription>
            </div>
            <Link href="/business/send-message">
              <Button size="sm" className="w-full sm:w-auto gap-2">
                <Send className="h-4 w-4" />
                Yeni Mesaj Gönder
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats?.recentLogs && stats.recentLogs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri</TableHead>
                    <TableHead className="hidden sm:table-cell">Telefon</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="hidden md:table-cell">Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.customer_name}</TableCell>
                      <TableCell className="hidden sm:table-cell font-mono text-sm">
                        {log.customer_phone}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            log.status === 'sent'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {log.status === 'sent' ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {log.status === 'sent' ? 'Başarılı' : 'Başarısız'}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('tr-TR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Henüz mesaj gönderilmedi
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                İlk mesajınızı göndermek için Mesaj Gönder sayfasına gidin
              </p>
              <Link href="/business/send-message">
                <Button size="sm" variant="outline">
                  Mesaj Gönder
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
