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
    return <div>Yükleniyor...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam İşletme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.businesses.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tüm işletmeler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif İşletme</CardTitle>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pasif İşletme</CardTitle>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Mesaj</CardTitle>
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

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {/* Active Rate Card */}
        <Card>
          <CardHeader>
            <CardTitle>İşletme Durumu</CardTitle>
            <CardDescription>Aktif/Pasif dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Aktif Oranı</span>
                  <span className="text-2xl font-bold">
                    {stats?.businesses.activeRate || 0}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${stats?.businesses.activeRate || 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Aktif</div>
                  <div className="font-semibold text-green-600">
                    {stats?.businesses.active || 0}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Pasif</div>
                  <div className="font-semibold text-red-600">
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
            <CardTitle>Hızlı İşlemler</CardTitle>
            <CardDescription>Yaygın işlemler</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/businesses" className="block">
              <Button variant="outline" className="w-full justify-start">
                İşletmeleri Yönet
              </Button>
            </Link>
            <Link href="/admin/businesses" className="block">
              <Button variant="outline" className="w-full justify-start">
                Yeni İşletme Ekle
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Businesses */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Son Eklenen İşletmeler</CardTitle>
              <CardDescription>En son eklenen işletmeler</CardDescription>
            </div>
            <Link href="/admin/businesses">
              <Button variant="outline" size="sm">Tümünü Gör</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats?.recentBusinesses && stats.recentBusinesses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İşletme Adı</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Oluşturulma Tarihi</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentBusinesses.map((business) => (
                  <TableRow key={business.id}>
                    <TableCell className="font-medium">{business.name}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          business.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {business.status === 'active' ? 'Aktif' : 'Pasif'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(business.created_at).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/businesses/${business.id}`}>
                        <Button variant="outline" size="sm">
                          Detay
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Henüz işletme eklenmedi
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

