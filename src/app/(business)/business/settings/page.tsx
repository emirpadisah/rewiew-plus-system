'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

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

    setSaving(true)
    try {
      const response = await fetch('/api/business/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_platform: 'custom',
          review_url: reviewUrl.trim(),
          message_template: messageTemplate || null,
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
    return <div>Yükleniyor...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Ayarlar</h1>

      <Card>
        <CardHeader>
          <CardTitle>Ayarlar</CardTitle>
          <CardDescription>
            Mesaj gönderme ayarlarınızı yapılandırın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="review-url">Review URL</Label>
            <Input
              id="review-url"
              type="url"
              value={reviewUrl}
              onChange={(e) => setReviewUrl(e.target.value)}
              placeholder="https://g.page/r/YOUR_GOOGLE_REVIEW_LINK"
            />
            <div className="text-xs text-muted-foreground">
              Müşterilere gönderilecek review linkini girin
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message-template">Mesaj Şablonu</Label>
            <Textarea
              id="message-template"
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              placeholder="Merhaba {firstName}, bizimle deneyiminizi değerlendirmek ister misiniz? {reviewUrl}"
              rows={4}
              className="font-mono text-sm"
            />
            <div className="text-xs text-muted-foreground">
              Kullanılabilir değişkenler: <code className="bg-muted px-1 rounded">&#123;firstName&#125;</code> (müşterinin adı), <code className="bg-muted px-1 rounded">&#123;reviewUrl&#125;</code> (review linki)
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

