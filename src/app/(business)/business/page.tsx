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
    return <div>Yükleniyor...</div>
  }

  const whatsappStatusText = {
    connected: 'Bağlı',
    disconnected: 'Bağlı Değil',
    pending: 'Beklemede',
  }[stats?.whatsapp.status || 'disconnected']

  const whatsappStatusColor = {
    connected: 'text-green-600',
    disconnected: 'text-red-600',
    pending: 'text-yellow-600',
  }[stats?.whatsapp.status || 'disconnected']

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Mesaj</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.messages.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tüm zamanlar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarılı Mesaj</CardTitle>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugün</CardTitle>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Müşteriler</CardTitle>
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

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {/* WhatsApp Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Bağlantı Durumu</CardTitle>
            <CardDescription>Mevcut bağlantı bilgileri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Durum</div>
                <div className={`text-2xl font-bold ${whatsappStatusColor}`}>
                  {whatsappStatusText}
                </div>
              </div>
              {stats?.whatsapp.lastSeenAt && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Son Görülme</div>
                  <div className="text-sm">
                    {new Date(stats.whatsapp.lastSeenAt).toLocaleString('tr-TR')}
                  </div>
                </div>
              )}
              <Link href="/business/whatsapp">
                <Button variant="outline" className="w-full">
                  Bağlantıyı Yönet
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Success Rate Card */}
        <Card>
          <CardHeader>
            <CardTitle>Başarı Oranı</CardTitle>
            <CardDescription>Mesaj gönderme performansı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Başarı Oranı</span>
                  <span className="text-2xl font-bold">
                    {stats?.messages.successRate || 0}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${stats?.messages.successRate || 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Başarılı</div>
                  <div className="font-semibold text-green-600">
                    {stats?.messages.sent || 0}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Başarısız</div>
                  <div className="font-semibold text-red-600">
                    {stats?.messages.failed || 0}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Son Mesajlar</CardTitle>
              <CardDescription>Son gönderilen mesajların listesi</CardDescription>
            </div>
            <Link href="/business/send-message">
              <Button size="sm">Yeni Mesaj Gönder</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats?.recentLogs && stats.recentLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.customer_name}</TableCell>
                    <TableCell>{log.customer_phone}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          log.status === 'sent'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.status === 'sent' ? 'Başarılı' : 'Başarısız'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(log.created_at).toLocaleString('tr-TR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Henüz mesaj gönderilmedi
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

