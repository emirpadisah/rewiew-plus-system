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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  MessageSquare, 
  TrendingUp, 
  CheckCircle2, 
  XCircle,
  Search,
  Loader2,
  BarChart3,
  ArrowUpDown
} from 'lucide-react'
import Link from 'next/link'

interface BusinessMessageStats {
  business_id: string
  business_name: string
  total: number
  sent: number
  failed: number
  success_rate: number
  last_message_at: string | null
}

type SortField = 'total' | 'sent' | 'failed' | 'success_rate' | 'business_name'
type SortDirection = 'asc' | 'desc'

export default function MessageStatsPage() {
  const [stats, setStats] = useState<BusinessMessageStats[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('total')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/message-stats')
      const data = await response.json()
      setStats(data.stats || [])
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const filteredAndSortedStats = stats
    .filter((stat) =>
      stat.business_name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: number | string
      let bValue: number | string

      switch (sortField) {
        case 'total':
          aValue = a.total
          bValue = b.total
          break
        case 'sent':
          aValue = a.sent
          bValue = b.sent
          break
        case 'failed':
          aValue = a.failed
          bValue = b.failed
          break
        case 'success_rate':
          aValue = a.success_rate
          bValue = b.success_rate
          break
        case 'business_name':
          aValue = a.business_name.toLowerCase()
          bValue = b.business_name.toLowerCase()
          break
        default:
          return 0
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })

  const totalStats = stats.reduce(
    (acc, stat) => ({
      total: acc.total + stat.total,
      sent: acc.sent + stat.sent,
      failed: acc.failed + stat.failed,
    }),
    { total: 0, sent: 0, failed: 0 }
  )

  const overallSuccessRate =
    totalStats.total > 0
      ? Math.round((totalStats.sent / totalStats.total) * 100)
      : 0

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mesaj İstatistikleri</h1>
        <p className="text-muted-foreground mt-1">
          Tüm işletmelerin mesaj gönderme performansı ve istatistikleri
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Mesaj
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tüm işletmeler
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
              {totalStats.sent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Başarı oranı: {overallSuccessRate}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Başarısız Mesaj
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {totalStats.failed.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Toplam başarısız
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktif İşletme
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.filter((s) => s.total > 0).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Mesaj gönderen işletme sayısı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Stats Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                İşletme Performansı
              </CardTitle>
              <CardDescription>
                {filteredAndSortedStats.length} işletme bulundu
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="İşletme ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {search ? 'İşletme bulunamadı' : 'Henüz mesaj istatistiği yok'}
              </p>
              <p className="text-xs text-muted-foreground">
                {search
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                  : 'İşletmeler mesaj göndermeye başladığında istatistikler burada görünecek'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('business_name')}
                        className="h-8 gap-2 -ml-3"
                      >
                        İşletme Adı
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('total')}
                        className="h-8 gap-2 -mr-3"
                      >
                        Toplam
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('sent')}
                        className="h-8 gap-2 -mr-3"
                      >
                        Başarılı
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right hidden md:table-cell">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('failed')}
                        className="h-8 gap-2 -mr-3"
                      >
                        Başarısız
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right hidden lg:table-cell">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('success_rate')}
                        className="h-8 gap-2 -mr-3"
                      >
                        Başarı Oranı
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right hidden xl:table-cell">
                      Son Mesaj
                    </TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedStats.map((stat) => (
                    <TableRow key={stat.business_id}>
                      <TableCell className="font-medium">
                        {stat.business_name}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {stat.total.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        <span className="text-green-600 font-medium">
                          {stat.sent.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell">
                        <span className="text-red-600 font-medium">
                          {stat.failed.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right hidden lg:table-cell">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`font-semibold ${
                              stat.success_rate >= 90
                                ? 'text-green-600'
                                : stat.success_rate >= 70
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          >
                            {stat.success_rate}%
                          </span>
                          <div className="w-16 bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                stat.success_rate >= 90
                                  ? 'bg-green-600'
                                  : stat.success_rate >= 70
                                  ? 'bg-yellow-600'
                                  : 'bg-red-600'
                              }`}
                              style={{ width: `${stat.success_rate}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right hidden xl:table-cell text-sm text-muted-foreground">
                        {stat.last_message_at
                          ? new Date(stat.last_message_at).toLocaleDateString('tr-TR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/businesses/${stat.business_id}`}>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}

