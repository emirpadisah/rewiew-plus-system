'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Settings as SettingsIcon, Save, Loader2, Link as LinkIcon, FileText } from 'lucide-react'

export default function SettingsPage() {
  const { toast } = useToast()
  const [reviewUrl, setReviewUrl] = useState('')
  const [messageTemplate, setMessageTemplate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [templates, setTemplates] = useState<
    Array<{ id: string; name: string; template: string; is_default: boolean }>
  >([])
  const [selectedTemplateId, setSelectedTemplateId] = useState('')

  useEffect(() => {
    const init = async () => {
      const settingsData = await fetchSettings()
      await fetchTemplates(settingsData?.message_template)
    }
    init()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/business/settings')
      const data = await response.json()
      if (data) {
        setReviewUrl(data.review_url || '')
        setMessageTemplate(
          data.message_template ||
            'Merhaba {firstName}, bizimle deneyiminizi değerlendirmek ister misiniz? {reviewUrl}'
        )
      }
      return data
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async (currentTemplate?: string | null) => {
    try {
      const response = await fetch('/api/business/message-templates')
      const data = await response.json()
      const list = data.templates || []

      setTemplates(list)

      if (!list.length) {
        return
      }

      const templateFromSettings = currentTemplate || messageTemplate
      let selected = templateFromSettings
        ? list.find((t: any) => t.template === templateFromSettings)
        : undefined

      if (!selected) {
        selected = list.find((t: any) => t.is_default) || list[0]
      }

      if (selected) {
        setSelectedTemplateId(selected.id)
        setMessageTemplate(selected.template)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const handleSave = async () => {
    if (!reviewUrl.trim()) {
      toast({
        title: 'Hata',
        description: 'Review URL gereklidir',
        variant: 'destructive',
      })
      return
    }

    try {
      new URL(reviewUrl.trim())
    } catch {
      toast({
        title: 'Hata',
        description: 'Geçerli bir URL girin (örn: https://g.page/r/...)',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/business/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_platform: 'custom',
          review_url: reviewUrl.trim() || null,
          message_template: messageTemplate.trim() || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save settings')
      }

      toast({
        title: 'Başarılı',
        description: 'Ayarlar kaydedildi',
      })
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Ayarlar kaydedilirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-muted-foreground mt-1">
          Mesaj gönderme ayarlarınızı yapılandırın
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Review URL
              </CardTitle>
              <CardDescription>
                Müşterilere gönderilecek review linkini yapılandırın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="review-url">Review Link</Label>
                <Input
                  id="review-url"
                  type="url"
                  value={reviewUrl}
                  onChange={(e) => setReviewUrl(e.target.value)}
                  placeholder="https://g.page/r/YOUR_GOOGLE_REVIEW_LINK"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Google Maps, Tripadvisor veya diğer review platformlarının linkini girebilirsiniz
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Mesaj Şablonu
              </CardTitle>
              <CardDescription>
                Kayıtlı şablonlarınız arasından kullanılacak mesaj şablonunu seçin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Varsayılan Şablon</Label>
                <Select
                  value={selectedTemplateId}
                  onValueChange={(value) => {
                    setSelectedTemplateId(value)
                    const selected = templates.find((t) => t.id === value)
                    if (selected) {
                      setMessageTemplate(selected.template)
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Bir şablon seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.length === 0 ? (
                      <SelectItem value="no-templates" disabled>
                        Henüz şablon oluşturulmamış
                      </SelectItem>
                    ) : (
                      templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                          {template.is_default ? ' (Varsayılan)' : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Şablonlarınızı `Şablonlar` menüsünden oluşturup düzenleyebilirsiniz.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Preview Card */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Önizleme
              </CardTitle>
              <CardDescription>
                Mesaj önizlemesi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted border-2 border-dashed">
                <p className="text-sm text-muted-foreground mb-2">Örnek Mesaj:</p>
                <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                  {messageTemplate
                    .replace(/{firstName}/g, 'Ahmet')
                    .replace(/{reviewUrl}/g, reviewUrl || 'https://example.com/review')}
                </p>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={saving} 
                className="w-full gap-2"
                size="lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Ayarları Kaydet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
