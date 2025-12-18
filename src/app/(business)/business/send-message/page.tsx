'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Customer } from '@/types'
import { 
  Send, 
  Users, 
  MessageSquare, 
  CheckCircle2,
  Loader2,
  AlertCircle,
  Eye
} from 'lucide-react'

export default function SendMessagePage() {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [settings, setSettings] = useState<{ review_platform: string; review_url: string | null; message_template: string | null } | null>(null)

  useEffect(() => {
    fetchCustomers()
    fetchSettings()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/business/customers?limit=1000')
      const data = await response.json()
      setCustomers(data.data || [])
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

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/business/settings')
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleSelectAll = () => {
    if (selectedCustomers.size === customers.length) {
      setSelectedCustomers(new Set())
    } else {
      setSelectedCustomers(new Set(customers.map((c) => c.id)))
    }
  }

  const handleToggleCustomer = (customerId: string) => {
    const newSelected = new Set(selectedCustomers)
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId)
    } else {
      newSelected.add(customerId)
    }
    setSelectedCustomers(newSelected)
  }

  const handleSend = async () => {
    if (selectedCustomers.size === 0) {
      toast({
        title: 'Hata',
        description: 'En az bir müşteri seçin',
        variant: 'destructive',
      })
      return
    }

    if (!settings?.review_url) {
      toast({
        title: 'Hata',
        description: 'Review URL ayarlanmamış. Lütfen ayarlar sayfasından yapılandırın.',
        variant: 'destructive',
      })
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/business/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerIds: Array.from(selectedCustomers),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send messages')
      }

      if (data.failed > 0 && data.results) {
        const failedResults = data.results.filter((r: any) => !r.success)
        toast({
          title: data.sent > 0 ? 'Kısmen Başarılı' : 'Hata',
          description: `${data.sent} mesaj gönderildi, ${data.failed} mesaj başarısız. ${failedResults.length > 0 ? `Hata: ${failedResults[0].error}` : ''}`,
          variant: data.sent > 0 ? 'default' : 'destructive',
        })
      } else {
        toast({
          title: 'Başarılı',
          description: `${data.sent} mesaj gönderildi`,
        })
      }

      setSelectedCustomers(new Set())
      fetchCustomers()
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Mesajlar gönderilirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const previewMessage = (customerName: string) => {
    const firstName = customerName.split(' ')[0]
    const reviewUrl = settings?.review_url || 'https://example.com/review'
    const template = settings?.message_template || 'Merhaba {firstName}, bizimle deneyiminizi değerlendirmek ister misiniz? {reviewUrl}'
    return template
      .replace(/{firstName}/g, firstName)
      .replace(/{reviewUrl}/g, reviewUrl)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mesaj Gönder</h1>
        <p className="text-muted-foreground mt-1">
          Müşterilerinize review linki gönderin
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customers List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Müşteriler
                  </CardTitle>
                  <CardDescription>
                    Mesaj göndermek için müşterileri seçin
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={handleSelectAll} className="gap-2">
                  {selectedCustomers.size === customers.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {customers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Henüz müşteri eklenmedi
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Önce müşteriler sayfasından müşteri ekleyin
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedCustomers.size === customers.length && customers.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>İsim</TableHead>
                        <TableHead className="hidden sm:table-cell">Telefon</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow 
                          key={customer.id}
                          className={selectedCustomers.has(customer.id) ? 'bg-muted/50' : ''}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedCustomers.has(customer.id)}
                              onCheckedChange={() => handleToggleCustomer(customer.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell className="hidden sm:table-cell font-mono text-sm">
                            {customer.phone}
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

        {/* Preview & Send */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Mesaj Önizleme
              </CardTitle>
              <CardDescription>
                Gönderilecek mesaj örneği
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCustomers.size > 0 ? (
                <>
                  <div className="p-4 rounded-lg bg-muted border-2 border-dashed">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Örnek Mesaj:</p>
                    <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                      {previewMessage(
                        customers.find((c) => selectedCustomers.has(c.id))?.name || 'Müşteri'
                      )}
                    </p>
                  </div>
                  
                  {!settings?.review_url && (
                    <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div className="text-xs text-yellow-800 dark:text-yellow-200">
                          Review URL ayarlanmamış. Lütfen ayarlar sayfasından yapılandırın.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-sm">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        {selectedCustomers.size} müşteri seçildi
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSend}
                    disabled={sending || selectedCustomers.size === 0 || !settings?.review_url}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Mesaj Gönder ({selectedCustomers.size})
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Müşteri seçin
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mesaj önizlemesi için müşteri seçin
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
