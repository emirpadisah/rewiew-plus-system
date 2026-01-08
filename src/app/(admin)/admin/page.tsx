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
  Building2, 
  CheckCircle2, 
  XCircle, 
  MessageSquare,
  TrendingUp
} from 'lucide-react'

interface Stats {
  businesses: {
    total: number
    active: number
    passive: number
    activeRate: number
  }
  totalMessages: number
  recentBusinesses: Array<{
    id: string
    name: string
    status: string
    created_at: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Sistem genelinde istatistikler ve yönetim
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam İşletme
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.businesses.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tüm işletmeler
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktif İşletme
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats?.businesses.active || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Aktif oranı: {stats?.businesses.activeRate || 0}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pasif İşletme
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats?.businesses.passive || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pasif durumdaki işletmeler
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Mesaj
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.totalMessages || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gönderilen tüm mesajlar
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Active Rate Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              İşletme Durumu
            </CardTitle>
            <CardDescription>Aktif/Pasif dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Aktif Oranı</span>
                  <span className="text-3xl font-bold text-green-600">
                    {stats?.businesses.activeRate || 0}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats?.businesses.activeRate || 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                  <div className="text-xs text-muted-foreground mb-1">Aktif</div>
                  <div className="text-xl font-bold text-green-600">
                    {stats?.businesses.active || 0}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                  <div className="text-xs text-muted-foreground mb-1">Pasif</div>
                  <div className="text-xl font-bold text-red-600">
                    {stats?.businesses.passive || 0}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Hızlı İşlemler
            </CardTitle>
            <CardDescription>Yaygın işlemler</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/businesses" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Building2 className="h-4 w-4" />
                İşletmeleri Yönet
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Businesses */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Son Eklenen İşletmeler
              </CardTitle>
              <CardDescription>En son eklenen işletmeler</CardDescription>
            </div>
            <Link href="/admin/businesses">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Tümünü Gör
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats?.recentBusinesses && stats.recentBusinesses.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>İşletme Adı</TableHead>
                    <TableHead className="hidden sm:table-cell">Durum</TableHead>
                    <TableHead className="hidden md:table-cell">Oluşturulma Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentBusinesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell className="font-medium">{business.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            business.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {business.status === 'active' ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {business.status === 'active' ? 'Aktif' : 'Pasif'}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {new Date(business.created_at).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/businesses/${business.id}`}>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            Detay
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Henüz işletme eklenmedi
              </p>
              <p className="text-xs text-muted-foreground">
                İlk işletmeyi eklemek için İşletmeler sayfasına gidin
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

