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
  FileUp,
  Edit,
  Tag,
  StickyNote,
  Filter
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerNotes, setCustomerNotes] = useState('')
  const [customerCategory, setCustomerCategory] = useState('')
  const [updating, setUpdating] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const limit = 10

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/business/customers?limit=1000&offset=0${search ? `&search=${encodeURIComponent(search)}` : ''}`
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

  // Get unique categories from customers
  const categories = Array.from(
    new Set(
      customers
        .map((c) => c.category)
        .filter((cat): cat is string => cat !== null && cat !== '')
    )
  ).sort()

  // Filter customers by category and search
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone.includes(search) ||
      (customer.notes && customer.notes.toLowerCase().includes(search.toLowerCase()))
    
    const matchesCategory =
      categoryFilter === 'all' ||
      (categoryFilter === 'uncategorized' && !customer.category) ||
      customer.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Paginate filtered results
  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * limit,
    page * limit
  )
  const filteredTotal = filteredCustomers.length

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

  const handleOpenEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerNotes(customer.notes || '')
    setCustomerCategory(customer.category || '')
    setEditDialogOpen(true)
  }

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/business/customers/${selectedCustomer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: customerNotes.trim() || null,
          category: customerCategory.trim() || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update customer')
      }

      toast({
        title: 'Başarılı',
        description: 'Müşteri bilgileri güncellendi',
      })
      setEditDialogOpen(false)
      setSelectedCustomer(null)
      fetchCustomers()
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Müşteri güncellenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setUpdating(false)
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

          {/* Edit Customer Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Müşteri Düzenle
                </DialogTitle>
                <DialogDescription>
                  {selectedCustomer?.name} için not ve kategori ekleyin
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Kategori
                  </Label>
                  <Input
                    id="category"
                    value={customerCategory}
                    onChange={(e) => setCustomerCategory(e.target.value)}
                    placeholder="Örn: VIP, Yeni Müşteri, Düzenli"
                  />
                  <p className="text-xs text-muted-foreground">
                    Müşteriyi kategorize etmek için bir kategori adı girin
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2">
                    <StickyNote className="h-4 w-4" />
                    Notlar
                  </Label>
                  <Textarea
                    id="notes"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Müşteri hakkında notlar..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Müşteri hakkında özel notlar ekleyebilirsiniz
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleUpdateCustomer} disabled={updating} className="gap-2">
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      Kaydet
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Müşteri adı, telefon veya not ara..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Kategori Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                <SelectItem value="uncategorized">Kategorisiz</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            {categoryFilter !== 'all' || search
              ? `${filteredTotal} müşteri bulundu (Toplam: ${total})`
              : `Toplam ${total} müşteri`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : paginatedCustomers.length === 0 ? (
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
                    <TableHead className="hidden md:table-cell">Kategori</TableHead>
                    <TableHead className="hidden lg:table-cell">Not</TableHead>
                    <TableHead className="hidden xl:table-cell">Eklenme Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="hidden sm:table-cell font-mono text-sm">
                          {customer.phone}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {customer.category ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              <Tag className="h-3 w-3" />
                              {customer.category}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-xs truncate">
                          {customer.notes || '-'}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                          {new Date(customer.created_at).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditDialog(customer)}
                            className="gap-2 w-full sm:w-auto"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="hidden sm:inline">Düzenle</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredTotal > limit && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    Sayfa {page} / {Math.ceil(filteredTotal / limit)} ({filteredTotal} müşteri)
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
                      disabled={page * limit >= filteredTotal}
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
