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
        // Show detailed error messages for failed messages
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
    
    // Get message template or use default
    const template = settings?.message_template || 'Merhaba {firstName}, bizimle deneyiminizi değerlendirmek ister misiniz? {reviewUrl}'
    
    // Replace placeholders
    return template
      .replace(/{firstName}/g, firstName)
      .replace(/{reviewUrl}/g, reviewUrl)
  }

  if (loading) {
    return <div>Yükleniyor...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Mesaj Gönder</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Müşteriler</CardTitle>
                  <CardDescription>
                    Mesaj göndermek için müşterileri seçin
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={handleSelectAll}>
                  {selectedCustomers.size === customers.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {customers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Müşteri bulunamadı
                </div>
              ) : (
                <div className="border rounded-lg">
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
                        <TableHead>Telefon</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedCustomers.has(customer.id)}
                              onCheckedChange={() => handleToggleCustomer(customer.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {customer.name}
                          </TableCell>
                          <TableCell>{customer.phone}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Mesaj Önizleme</CardTitle>
              <CardDescription>
                Gönderilecek mesaj örneği
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCustomers.size > 0 ? (
                <>
                  <div className="p-4 bg-muted rounded-lg text-sm">
                    {previewMessage(
                      customers.find((c) => selectedCustomers.has(c.id))?.name || 'Müşteri'
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedCustomers.size} müşteri seçildi
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={sending || selectedCustomers.size === 0}
                    className="w-full"
                  >
                    {sending ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                  </Button>
                </>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  Mesaj önizlemesi için müşteri seçin
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

