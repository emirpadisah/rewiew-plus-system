'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { MessageTemplate } from '@/types'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Star,
  Loader2,
  Copy,
  CheckCircle2,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

export default function MessageTemplatesPage() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [templateContent, setTemplateContent] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/business/message-templates')
      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast({
        title: 'Hata',
        description: 'Şablonlar yüklenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateDialog = () => {
    setTemplateName('')
    setTemplateContent('Merhaba {firstName}, bizimle deneyiminizi değerlendirmek ister misiniz? {reviewUrl}')
    setIsDefault(false)
    setDialogOpen(true)
  }

  const handleOpenEditDialog = (template: MessageTemplate) => {
    setSelectedTemplate(template)
    setTemplateName(template.name)
    setTemplateContent(template.template)
    setIsDefault(template.is_default)
    setEditDialogOpen(true)
  }

  const handleCreateTemplate = async () => {
    if (!templateName.trim() || !templateContent.trim()) {
      toast({
        title: 'Hata',
        description: 'Şablon adı ve içeriği gereklidir',
        variant: 'destructive',
      })
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/business/message-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName.trim(),
          template: templateContent.trim(),
          is_default: isDefault,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create template')
      }

      toast({
        title: 'Başarılı',
        description: 'Şablon oluşturuldu',
      })
      setDialogOpen(false)
      fetchTemplates()
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Şablon oluşturulurken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate || !templateName.trim() || !templateContent.trim()) {
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`/api/business/message-templates/${selectedTemplate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName.trim(),
          template: templateContent.trim(),
          is_default: isDefault,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update template')
      }

      toast({
        title: 'Başarılı',
        description: 'Şablon güncellendi',
      })
      setEditDialogOpen(false)
      setSelectedTemplate(null)
      fetchTemplates()
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Şablon güncellenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/business/message-templates/${selectedTemplate.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete template')
      }

      toast({
        title: 'Başarılı',
        description: 'Şablon silindi',
      })
      setDeleteDialogOpen(false)
      setSelectedTemplate(null)
      fetchTemplates()
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Şablon silinirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleCopyTemplate = (template: string) => {
    navigator.clipboard.writeText(template)
    toast({
      title: 'Kopyalandı',
      description: 'Şablon panoya kopyalandı',
    })
  }

  const previewTemplate = (template: string) => {
    return template
      .replace(/{firstName}/g, 'Ahmet')
      .replace(/{reviewUrl}/g, 'https://g.page/r/YOUR_REVIEW_LINK')
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mesaj Şablonları</h1>
          <p className="text-muted-foreground mt-1">
            Mesaj şablonlarınızı oluşturun, düzenleyin ve yönetin
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Yeni Şablon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Yeni Mesaj Şablonu
              </DialogTitle>
              <DialogDescription>
                Müşterilere gönderilecek mesaj şablonu oluşturun
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Şablon Adı</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Örn: Standart Mesaj, VIP Mesajı"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-content">Şablon İçeriği</Label>
                <Textarea
                  id="template-content"
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-default"
                  checked={isDefault}
                  onCheckedChange={(checked) => setIsDefault(checked === true)}
                />
                <Label htmlFor="is-default" className="text-sm font-normal cursor-pointer">
                  Varsayılan şablon olarak ayarla
                </Label>
              </div>
              {templateContent && (
                <div className="p-4 rounded-lg bg-muted border-2 border-dashed">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Önizleme:</p>
                  <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                    {previewTemplate(templateContent)}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleCreateTemplate} disabled={creating} className="gap-2">
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Oluştur
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Şablon Listesi
          </CardTitle>
          <CardDescription>
            {templates.length} şablon bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Henüz şablon oluşturulmadı
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                İlk şablonunuzu oluşturmak için Yeni Şablon butonuna tıklayın
              </p>
              <Button onClick={handleOpenCreateDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Yeni Şablon Oluştur
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Şablon Adı</TableHead>
                    <TableHead className="hidden md:table-cell">İçerik</TableHead>
                    <TableHead className="hidden lg:table-cell">Önizleme</TableHead>
                    <TableHead className="text-center">Varsayılan</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {template.name}
                          {template.is_default && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-xs truncate">
                        {template.template}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-xs truncate">
                        {previewTemplate(template.template)}
                      </TableCell>
                      <TableCell className="text-center">
                        {template.is_default ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyTemplate(template.template)}
                            className="gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            <span className="hidden sm:inline">Kopyala</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditDialog(template)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="hidden sm:inline">Düzenle</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(template)
                              setDeleteDialogOpen(true)
                            }}
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Sil</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Şablon Düzenle
            </DialogTitle>
            <DialogDescription>
              Mesaj şablonunu düzenleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-template-name">Şablon Adı</Label>
              <Input
                id="edit-template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Örn: Standart Mesaj, VIP Mesajı"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-template-content">Şablon İçeriği</Label>
              <Textarea
                id="edit-template-content"
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-is-default"
                checked={isDefault}
                onCheckedChange={(checked) => setIsDefault(checked === true)}
              />
              <Label htmlFor="edit-is-default" className="text-sm font-normal cursor-pointer">
                Varsayılan şablon olarak ayarla
              </Label>
            </div>
            {templateContent && (
              <div className="p-4 rounded-lg bg-muted border-2 border-dashed">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Önizleme:</p>
                <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                  {previewTemplate(templateContent)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleUpdateTemplate} disabled={updating} className="gap-2">
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Güncelleniyor...
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

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Şablonu Sil</DialogTitle>
            <DialogDescription>
              "{selectedTemplate?.name}" şablonunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate} disabled={deleting} className="gap-2">
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Sil
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

