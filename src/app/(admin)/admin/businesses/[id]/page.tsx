'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Business, WhatsAppConnection, User } from '@/types'
import { 
  Building2, 
  Users, 
  UserPlus, 
  Key, 
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react'

export default function BusinessDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const [business, setBusiness] = useState<Business | null>(null)
  const [whatsappConnection, setWhatsappConnection] = useState<WhatsAppConnection | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [creatingUser, setCreatingUser] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchBusiness()
    }
  }, [params.id])

  const fetchBusiness = async () => {
    setLoading(true)
    try {
      const [businessResponse, usersResponse] = await Promise.all([
        fetch(`/api/admin/businesses/${params.id}`),
        fetch(`/api/admin/businesses/${params.id}/users`),
      ])
      
      if (!businessResponse.ok) throw new Error('Failed to fetch business')
      const businessData = await businessResponse.json()
      setBusiness(businessData)
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users || [])
      }
      
      // Fetch WhatsApp connection status
      // Note: This would need a separate API endpoint or include in business response
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'İşletme bilgileri yüklenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (status: 'active' | 'passive') => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/businesses/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error('Failed to update status')

      toast({
        title: 'Başarılı',
        description: 'Durum güncellendi',
      })
      fetchBusiness()
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Durum güncellenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateDates = async (field: 'last_payment_at' | 'next_renewal_at', value: string | null) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/businesses/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })

      if (!response.ok) throw new Error('Failed to update dates')

      toast({
        title: 'Başarılı',
        description: 'Tarih güncellendi',
      })
      fetchBusiness()
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Tarih güncellenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleCreateUser = async () => {
    if (!userEmail || !userPassword) {
      toast({
        title: 'Hata',
        description: 'Email ve şifre gereklidir',
        variant: 'destructive',
      })
      return
    }

    setCreatingUser(true)
    try {
      const response = await fetch(`/api/admin/businesses/${params.id}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          password: userPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create user')
      }

      toast({
        title: 'Başarılı',
        description: 'Kullanıcı oluşturuldu',
      })
      setUserDialogOpen(false)
      setUserEmail('')
      setUserPassword('')
      fetchBusiness() // Refresh users list
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Kullanıcı oluşturulurken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setCreatingUser(false)
    }
  }

  const handleChangePassword = async () => {
    if (!selectedUserId || !newPassword.trim()) {
      toast({
        title: 'Hata',
        description: 'Şifre gereklidir',
        variant: 'destructive',
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Hata',
        description: 'Şifre en az 6 karakter olmalıdır',
        variant: 'destructive',
      })
      return
    }

    setChangingPassword(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUserId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update password')
      }

      toast({
        title: 'Başarılı',
        description: 'Şifre başarıyla güncellendi',
      })
      setPasswordDialogOpen(false)
      setSelectedUserId(null)
      setNewPassword('')
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Şifre güncellenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const openPasswordDialog = (userId: string) => {
    setSelectedUserId(userId)
    setNewPassword('')
    setPasswordDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm font-medium text-muted-foreground mb-1">
          İşletme bulunamadı
        </p>
        <p className="text-xs text-muted-foreground">
          İşletme silinmiş veya erişim yetkiniz olmayabilir
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{business.name}</h1>
        <p className="text-muted-foreground mt-1">
          İşletme detayları ve yönetim
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              İşletme Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Durum</Label>
              <div className="mt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  variant={business.status === 'active' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStatus('active')}
                  disabled={updating}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Aktif
                </Button>
                <Button
                  variant={business.status === 'passive' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStatus('passive')}
                  disabled={updating}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Pasif
                </Button>
              </div>
            </div>

            <div>
              <Label>Son Ödeme Tarihi</Label>
              <Input
                type="datetime-local"
                value={
                  business.last_payment_at
                    ? new Date(business.last_payment_at).toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  handleUpdateDates(
                    'last_payment_at',
                    e.target.value ? new Date(e.target.value).toISOString() : null
                  )
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label>Sonraki Yenileme Tarihi</Label>
              <Input
                type="datetime-local"
                value={
                  business.next_renewal_at
                    ? new Date(business.next_renewal_at).toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  handleUpdateDates(
                    'next_renewal_at',
                    e.target.value ? new Date(e.target.value).toISOString() : null
                  )
                }
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Kullanıcı İşlemleri
            </CardTitle>
            <CardDescription>
              Bu işletmeye ait kullanıcıları yönetin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto gap-2">
                  <UserPlus className="h-4 w-4" />
                  Yeni Kullanıcı Oluştur
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Kullanıcı</DialogTitle>
                  <DialogDescription>
                    İşletme için yeni bir kullanıcı hesabı oluşturun
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="kullanici@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-password">Şifre</Label>
                    <Input
                      id="user-password"
                      type="password"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="En az 6 karakter"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleCreateUser} disabled={creatingUser}>
                    {creatingUser ? 'Oluşturuluyor...' : 'Oluştur'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {users.length > 0 && (
              <div className="space-y-2">
                <Label>Mevcut Kullanıcılar</Label>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead className="hidden sm:table-cell">Oluşturulma</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPasswordDialog(user.id)}
                              className="w-full sm:w-auto gap-2"
                            >
                              <Key className="h-4 w-4" />
                              <span className="hidden sm:inline">Şifre Değiştir</span>
                              <span className="sm:hidden">Şifre</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {users.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Henüz kullanıcı oluşturulmamış
                </p>
                <p className="text-xs text-muted-foreground">
                  Bu işletme için ilk kullanıcıyı oluşturmak için yukarıdaki butona tıklayın
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Şifre Değiştir</DialogTitle>
            <DialogDescription>
              Kullanıcının şifresini değiştirin. İşletme şifresini unuttuysa buradan yeni şifre belirleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Yeni Şifre</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="En az 6 karakter"
              />
              <div className="text-xs text-muted-foreground">
                Şifre en az 6 karakter olmalıdır
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleChangePassword} disabled={changingPassword}>
              {changingPassword ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

