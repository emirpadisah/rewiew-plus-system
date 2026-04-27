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
import { BusinessLimitsSnapshot, Customer } from '@/types'
import { MAX_CUSTOMER_PACKAGE_LIMIT } from '@/lib/business-packages'
import {
  Send,
  Users,
  MessageSquare,
  Loader2,
  AlertCircle,
  Eye,
  FileText,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

type BusinessSettingsState = {
  review_platform: string
  review_url: string | null
  message_template: string | null
}

type Template = {
  id: string
  name: string
  template: string
  is_default: boolean
}

export default function SendMessagePage() {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [limits, setLimits] = useState<BusinessLimitsSnapshot | null>(null)
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set())
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [settings, setSettings] = useState<BusinessSettingsState | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('settings')

  useEffect(() => {
    fetchCustomers()
    fetchSettings()
    fetchTemplates()
    fetchLimits()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/business/customers?limit=${MAX_CUSTOMER_PACKAGE_LIMIT}`)
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

  const fetchLimits = async () => {
    try {
      const response = await fetch('/api/business/limits')
      if (!response.ok) {
        throw new Error('Failed to fetch limits')
      }

      const data = await response.json()
      setLimits(data)
    } catch (error) {
      console.error('Error fetching limits:', error)
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

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/business/message-templates')
      const data = await response.json()
      setTemplates(data.templates || [])

      const defaultTemplate = data.templates?.find((template: Template) => template.is_default)
      if (defaultTemplate) {
        setSelectedTemplateId(defaultTemplate.id)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const getApiErrorMessage = (data: any, fallback: string) => {
    if (!data?.error) {
      return fallback
    }

    const details: string[] = []

    if (typeof data.used === 'number' && typeof data.limit === 'number') {
      details.push(`Kullanım: ${data.used}/${data.limit}`)
    }

    if (typeof data.remaining === 'number') {
      details.push(`Kalan: ${data.remaining}`)
    }

    return details.length > 0
      ? `${data.error} (${details.join(', ')})`
      : data.error
  }

  const categories = Array.from(
    new Set(
      customers
        .map((customer) => customer.category)
        .filter((category): category is string => category !== null && category !== '')
    )
  ).sort()

  const filteredCustomers = customers.filter((customer) => {
    if (categoryFilter === 'all') {
      return true
    }

    if (categoryFilter === 'uncategorized') {
      return !customer.category
    }

    return customer.category === categoryFilter
  })

  const allFilteredSelected = filteredCustomers.length > 0
    && filteredCustomers.every((customer) => selectedCustomers.has(customer.id))

  const handleSelectAll = () => {
    const filteredCustomerIds = filteredCustomers.map((customer) => customer.id)
    const nextSelected = new Set(selectedCustomers)

    if (allFilteredSelected) {
      filteredCustomerIds.forEach((id) => nextSelected.delete(id))
    } else {
      filteredCustomerIds.forEach((id) => nextSelected.add(id))
    }

    setSelectedCustomers(nextSelected)
  }

  const handleToggleCustomer = (customerId: string) => {
    const nextSelected = new Set(selectedCustomers)
    if (nextSelected.has(customerId)) {
      nextSelected.delete(customerId)
    } else {
      nextSelected.add(customerId)
    }
    setSelectedCustomers(nextSelected)
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

    if (limits && !limits.packageAssigned) {
      toast({
        title: 'Hata',
        description: 'Paket atanmadan mesaj gönderemezsiniz. Lütfen yöneticinizle iletişime geçin.',
        variant: 'destructive',
      })
      return
    }

    if (limits && selectedCustomers.size > limits.remainingToday) {
      toast({
        title: 'Hata',
        description: `Seçim günlük limiti aşıyor. Kalan hakkınız: ${limits.remainingToday}`,
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
          templateId: selectedTemplateId === 'settings' ? undefined : selectedTemplateId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(getApiErrorMessage(data, 'Failed to send messages'))
      }

      if (data.failed > 0 && data.results) {
        const failedResults = data.results.filter((result: any) => !result.success)
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
      fetchLimits()
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

  const getSelectedTemplate = () => {
    if (selectedTemplateId === 'settings') {
      return settings?.message_template || 'Merhaba {firstName}, bizimle deneyiminizi değerlendirmek ister misiniz? {reviewUrl}'
    }

    if (selectedTemplateId) {
      const template = templates.find((item) => item.id === selectedTemplateId)
      if (template) {
        return template.template
      }
    }

    return settings?.message_template || 'Merhaba {firstName}, bizimle deneyiminizi değerlendirmek ister misiniz? {reviewUrl}'
  }

  const previewMessage = (customerName: string) => {
    const firstName = customerName.split(' ')[0]
    const reviewUrl = settings?.review_url || 'https://example.com/review'
    const template = getSelectedTemplate()

    return template
      .replace(/{firstName}/g, firstName)
      .replace(/{reviewUrl}/g, reviewUrl)
  }

  const selectionExceedsDailyLimit = Boolean(
    limits && selectedCustomers.size > limits.remainingToday
  )

  const sendBlocked = Boolean(
    limits && (!limits.packageAssigned || limits.remainingToday === 0 || selectionExceedsDailyLimit)
  )

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mesaj Gönder</h1>
        <p className="text-muted-foreground mt-1">
          Müşterilerinize review linki gönderin
        </p>
      </div>

      {limits && (
        <Card className={!limits.packageAssigned ? 'border-amber-200 bg-amber-50/60' : undefined}>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm font-medium">
                  {limits.packageAssigned ? `${limits.packageName} paketi` : 'Paket atanmadı'}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {limits.packageAssigned
                    ? `Bugün ${limits.usedToday.toLocaleString('tr-TR')} / ${limits.dailyMessageLimit.toLocaleString('tr-TR')} mesaj denemesi kullanıldı.`
                    : 'Yönetici paket atayana kadar mesaj gönderimi kapalı kalır.'}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Günlük kullanım</div>
                  <div className={`text-lg font-semibold ${limits.packageAssigned && limits.usedToday > limits.dailyMessageLimit ? 'text-red-600' : ''}`}>
                    {limits.usedToday.toLocaleString('tr-TR')} / {limits.dailyMessageLimit.toLocaleString('tr-TR')}
                  </div>
                </div>
                <div className="rounded-md border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Kalan hak</div>
                  <div className="text-lg font-semibold">
                    {limits.remainingToday.toLocaleString('tr-TR')}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Müşteriler
                    </CardTitle>
                    <CardDescription>
                      Mesaj göndermek için müşterileri seçin ve kategoriye göre filtreleyin
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSelectAll}
                    className="gap-2"
                    disabled={filteredCustomers.length === 0 || Boolean(limits && !limits.packageAssigned)}
                  >
                    {allFilteredSelected ? 'Filtreyi Kaldır' : 'Filtreyi Seç'}
                  </Button>
                </div>

                <div className="max-w-xs">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
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
              </div>
            </CardHeader>
            <CardContent>
              {filteredCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {customers.length === 0 ? 'Henüz müşteri eklenmedi' : 'Bu kategoride müşteri bulunamadı'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {customers.length === 0
                      ? 'Önce müşteriler sayfasından müşteri ekleyin'
                      : 'Başka bir kategori seçin veya kategorisiz müşterileri kontrol edin'}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={allFilteredSelected}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>İsim</TableHead>
                        <TableHead className="hidden md:table-cell">Kategori</TableHead>
                        <TableHead className="hidden sm:table-cell">Telefon</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
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
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {customer.category || 'Kategorisiz'}
                          </TableCell>
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
                  {templates.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="template-select" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Mesaj Şablonu
                      </Label>
                      <Select
                        value={selectedTemplateId}
                        onValueChange={setSelectedTemplateId}
                      >
                        <SelectTrigger id="template-select">
                          <SelectValue placeholder="Şablon seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="settings">Ayarlardan (Varsayılan)</SelectItem>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                              {template.is_default && ' *'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Mesaj göndermek için kullanılacak şablonu seçin
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-lg bg-muted border-2 border-dashed">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Örnek Mesaj:</p>
                    <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                      {previewMessage(
                        customers.find((customer) => selectedCustomers.has(customer.id))?.name || 'Müşteri'
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

                  {limits && !limits.packageAssigned && (
                    <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div className="text-xs text-yellow-800 dark:text-yellow-200">
                          Paket atanmadan mesaj gönderemezsiniz. Lütfen yöneticinizle iletişime geçin.
                        </div>
                      </div>
                    </div>
                  )}

                  {selectionExceedsDailyLimit && limits && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div className="text-xs text-red-800 dark:text-red-200">
                          Seçim günlük limitinizi aşıyor. Kalan hakkınız: {limits.remainingToday}
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
                    disabled={sending || selectedCustomers.size === 0 || !settings?.review_url || sendBlocked}
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
