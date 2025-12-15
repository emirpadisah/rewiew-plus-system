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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">İşletmeler</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Yeni İşletme</Button>
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

      <div className="mb-4">
        <Input
          placeholder="İşletme ara..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İşletme Adı</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Oluşturulma</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      İşletme bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  businesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell className="font-medium">
                        {business.name}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
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
                      <TableCell>
                        <Link href={`/admin/businesses/${business.id}`}>
                          <Button variant="outline" size="sm">
                            Detay
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Toplam {total} işletme
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Önceki
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * limit >= total}
              >
                Sonraki
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

