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
import { useToast } from '@/hooks/use-toast'
import { Customer } from '@/types'
import Papa from 'papaparse'

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

    // Validate E.164 format
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

          // Validate E.164 format
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Müşteriler</h1>
        <div className="flex gap-2">
          <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">CSV Yükle</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>CSV ile Toplu Müşteri Ekle</DialogTitle>
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
                <Button onClick={handleCsvUpload} disabled={creating || !csvFile}>
                  {creating ? 'Yükleniyor...' : 'Yükle'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Yeni Müşteri</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
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
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleCreateCustomer} disabled={creating}>
                  {creating ? 'Ekleniyor...' : 'Ekle'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Müşteri ara..."
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
                  <TableHead>İsim</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Eklenme Tarihi</TableHead>
                  <TableHead>Son Mesaj</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Müşteri bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>
                        {new Date(customer.created_at).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        {customer.last_message_at
                          ? new Date(customer.last_message_at).toLocaleDateString('tr-TR')
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Toplam {total} müşteri
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

