'use client'

import { useEffect, useState } from 'react'
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
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Customer } from '@/types'
import Papa from 'papaparse'
import { 
  Users, 
  Plus, 
  Upload, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  UserPlus,
  FileUp
} from 'lucide-react'

export default function CustomersPage() {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [csvDialogOpen, setCsvDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [creating, setCreating] = useState(false)

  const limit = 10

  useEffect(() => {
    fetchCustomers()
  }, [search, page])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/business/customers?limit=${limit}&offset=${(page - 1) * limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`
      )
      const data = await response.json()
      setCustomers(data.data || [])
      setTotal(data.count || 0)
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast({
        title: 'Hata',
        description: 'Müşteriler yüklenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCustomer = async () => {
    if (!name.trim() || !phone.trim()) {
      toast({
        title: 'Hata',
        description: 'İsim ve telefon gereklidir',
        variant: 'destructive',
      })
      return
    }

    if (!phone.match(/^\+[1-9]\d{1,14}$/)) {
      toast({
        title: 'Hata',
        description: 'Telefon numarası E.164 formatında olmalıdır (örn: +905551234567)',
        variant: 'destructive',
      })
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/business/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create customer')
      }

      toast({
        title: 'Başarılı',
        description: 'Müşteri eklendi',
      })
      setDialogOpen(false)
      setName('')
      setPhone('')
      fetchCustomers()
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Müşteri eklenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast({
        title: 'Hata',
        description: 'CSV dosyası seçin',
        variant: 'destructive',
      })
      return
    }

    setCreating(true)
    try {
      const text = await csvFile.text()
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const parsedCustomers = (results.data as any[])
            .map((row) => ({
              name: row.name?.trim() || row.Name?.trim() || '',
              phone: row.phone?.trim() || row.Phone?.trim() || '',
            }))
            .filter((c) => c.name && c.phone)

          if (parsedCustomers.length === 0) {
            toast({
              title: 'Hata',
              description: 'CSV dosyasında geçerli müşteri bulunamadı',
              variant: 'destructive',
            })
            setCreating(false)
            return
          }

          const invalid = parsedCustomers.find(
            (c) => !c.phone.match(/^\+[1-9]\d{1,14}$/)
          )
          if (invalid) {
            toast({
              title: 'Hata',
              description: `Geçersiz telefon formatı: ${invalid.phone}. E.164 formatında olmalıdır (örn: +905551234567)`,
              variant: 'destructive',
            })
            setCreating(false)
            return
          }

          try {
            const response = await fetch('/api/business/customers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customers: parsedCustomers }),
            })

            if (!response.ok) {
              const data = await response.json()
              throw new Error(data.error || 'Failed to upload customers')
            }

            toast({
              title: 'Başarılı',
              description: `${parsedCustomers.length} müşteri eklendi`,
            })
            setCsvDialogOpen(false)
            setCsvFile(null)
            fetchCustomers()
          } catch (error: any) {
            toast({
              title: 'Hata',
              description: error.message || 'Müşteriler yüklenirken bir hata oluştu',
              variant: 'destructive',
            })
          } finally {
            setCreating(false)
          }
        },
        error: (error: any) => {
          toast({
            title: 'Hata',
            description: `CSV parse hatası: ${error.message || 'Bilinmeyen hata'}`,
            variant: 'destructive',
          })
          setCreating(false)
        },
      })
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Dosya okunurken bir hata oluştu',
        variant: 'destructive',
      })
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Müşteriler</h1>
          <p className="text-muted-foreground mt-1">
            Müşteri bilgilerinizi yönetin ve organize edin
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">CSV Yükle</span>
                <span className="sm:hidden">CSV</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5" />
                  CSV ile Toplu Müşteri Ekle
                </DialogTitle>
                <DialogDescription>
                  CSV dosyası formatı: name, phone (E.164 formatında, örn: +905551234567)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-file">CSV Dosyası</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCsvDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleCsvUpload} disabled={creating || !csvFile} className="gap-2">
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Yükle
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Yeni Müşteri</span>
                <span className="sm:hidden">Yeni</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Yeni Müşteri Ekle
                </DialogTitle>
                <DialogDescription>
                  Müşteri bilgilerini girin. Telefon E.164 formatında olmalıdır (örn: +905551234567)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">İsim</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Müşteri adı"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+905551234567"
                  />
                  <p className="text-xs text-muted-foreground">
                    E.164 formatında olmalıdır (ülke kodu + numara)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleCreateCustomer} disabled={creating} className="gap-2">
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Ekleniyor...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Ekle
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Müşteri ara..."
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

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Müşteri Listesi
          </CardTitle>
          <CardDescription>
            Toplam {total} müşteri
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {search ? 'Müşteri bulunamadı' : 'Henüz müşteri eklenmedi'}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {search ? 'Arama kriterlerinizi değiştirmeyi deneyin' : 'İlk müşterinizi eklemek için Yeni Müşteri butonuna tıklayın'}
              </p>
              {!search && (
                <Button onClick={() => setDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Yeni Müşteri Ekle
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>İsim</TableHead>
                      <TableHead className="hidden sm:table-cell">Telefon</TableHead>
                      <TableHead className="hidden md:table-cell">Eklenme Tarihi</TableHead>
                      <TableHead className="hidden lg:table-cell">Son Mesaj</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="hidden sm:table-cell font-mono text-sm">
                          {customer.phone}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {new Date(customer.created_at).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {customer.last_message_at
                            ? new Date(customer.last_message_at).toLocaleDateString('tr-TR')
                            : '-'}
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
                    Sayfa {page} / {Math.ceil(total / limit)} ({total} müşteri)
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
