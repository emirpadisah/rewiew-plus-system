'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Business, BusinessStatus } from '@/types'
import { 
  Plus, 
  Building2, 
  Search, 
  CheckCircle2, 
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function BusinessesPage() {
  const { toast } = useToast()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newBusinessName, setNewBusinessName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [creating, setCreating] = useState(false)

  const limit = 10

  useEffect(() => {
    fetchBusinesses()
  }, [search, page])

  const fetchBusinesses = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/businesses?limit=${limit}&offset=${(page - 1) * limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`
      )
      const data = await response.json()
      setBusinesses(data.data || [])
      setTotal(data.count || 0)
    } catch (error) {
      console.error('Error fetching businesses:', error)
      toast({
        title: 'Hata',
        description: 'İşletmeler yüklenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBusiness = async () => {
    if (!newBusinessName.trim()) {
      toast({
        title: 'Hata',
        description: 'İşletme adı gereklidir',
        variant: 'destructive',
      })
      return
    }

    // Email ve şifre birlikte verilmeli veya hiçbiri verilmemeli
    if ((userEmail && !userPassword) || (!userEmail && userPassword)) {
      toast({
        title: 'Hata',
        description: 'Email ve şifre birlikte verilmelidir',
        variant: 'destructive',
      })
      return
    }

    if (userEmail && userPassword && userPassword.length < 6) {
      toast({
        title: 'Hata',
        description: 'Şifre en az 6 karakter olmalıdır',
        variant: 'destructive',
      })
      return
    }

    setCreating(true)
    try {
      const requestBody: any = { name: newBusinessName }
      if (userEmail && userPassword) {
        requestBody.userEmail = userEmail
        requestBody.userPassword = userPassword
      }

      const response = await fetch('/api/admin/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create business')
      }

      const result = await response.json()
      toast({
        title: 'Başarılı',
        description: result.userCreated
          ? 'İşletme ve kullanıcı oluşturuldu'
          : 'İşletme oluşturuldu',
      })
      setDialogOpen(false)
      setNewBusinessName('')
      setUserEmail('')
      setUserPassword('')
      fetchBusinesses()
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'İşletme oluşturulurken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">İşletmeler</h1>
          <p className="text-muted-foreground mt-1">
            Tüm işletmeleri görüntüleyin ve yönetin
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="h-4 w-4" />
              Yeni İşletme
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni İşletme Oluştur</DialogTitle>
              <DialogDescription>
                Yeni bir işletme eklemek için bilgileri girin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">İşletme Adı *</Label>
                <Input
                  id="name"
                  value={newBusinessName}
                  onChange={(e) => setNewBusinessName(e.target.value)}
                  placeholder="İşletme adı"
                  required
                />
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  İşletme için kullanıcı hesabı oluşturmak isterseniz aşağıdaki bilgileri doldurun (opsiyonel)
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Kullanıcı Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="kullanici@email.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-password">Kullanıcı Şifre</Label>
                    <Input
                      id="user-password"
                      type="password"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="En az 6 karakter"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleCreateBusiness} disabled={creating}>
                {creating ? 'Oluşturuluyor...' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="İşletme ara..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Businesses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            İşletme Listesi
          </CardTitle>
          <CardDescription>
            Toplam {total} işletme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : businesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {search ? 'İşletme bulunamadı' : 'Henüz işletme eklenmedi'}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {search ? 'Arama kriterlerinizi değiştirmeyi deneyin' : 'İlk işletmeyi eklemek için Yeni İşletme butonuna tıklayın'}
              </p>
              {!search && (
                <Button onClick={() => setDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Yeni İşletme Ekle
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>İşletme Adı</TableHead>
                      <TableHead className="hidden sm:table-cell">Durum</TableHead>
                      <TableHead className="hidden md:table-cell">Oluşturulma</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businesses.map((business) => (
                      <TableRow key={business.id}>
                        <TableCell className="font-medium">
                          {business.name}
                        </TableCell>
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

              {/* Pagination */}
              {total > limit && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    Sayfa {page} / {Math.ceil(total / limit)} ({total} işletme)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Önceki
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page * limit >= total}
                      className="gap-2"
                    >
                      Sonraki
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

