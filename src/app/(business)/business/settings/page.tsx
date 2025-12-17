'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Settings as SettingsIcon, Save, Loader2, Link as LinkIcon, FileText } from 'lucide-react'

export default function SettingsPage() {
  const { toast } = useToast()
  const [reviewUrl, setReviewUrl] = useState('')
  const [messageTemplate, setMessageTemplate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/business/settings')
      const data = await response.json()
      if (data) {
        setReviewUrl(data.review_url || '')
        setMessageTemplate(data.message_template || 'Merhaba {firstName}, bizimle deneyiminizi değerlendirmek ister misiniz? {reviewUrl}')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
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
                Müşterilere gönderilecek mesajın şablonunu özelleştirin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message-template">Mesaj İçeriği</Label>
                <Textarea
                  id="message-template"
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  placeholder="Merhaba {firstName}, bizimle deneyiminizi değerlendirmek ister misiniz? {reviewUrl}"
                  rows={6}
                  className="font-mono text-sm"
                />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Kullanılabilir değişkenler:</p>
                  <div className="flex flex-wrap gap-2">
                    <code className="px-2 py-1 rounded bg-muted text-xs font-mono">
                      {'{firstName}'}
                    </code>
                    <span className="text-xs text-muted-foreground">→ Müşterinin adı</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <code className="px-2 py-1 rounded bg-muted text-xs font-mono">
                      {'{reviewUrl}'}
                    </code>
                    <span className="text-xs text-muted-foreground">→ Review linki</span>
                  </div>
                </div>
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
                <p className="text-sm whitespace-pre-wrap">
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
