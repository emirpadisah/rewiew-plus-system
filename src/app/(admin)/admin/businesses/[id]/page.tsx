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
    return <div>Yükleniyor...</div>
  }

  if (!business) {
    return <div>İşletme bulunamadı</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{business.name}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>İşletme Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Durum</Label>
              <div className="mt-2 flex gap-2">
                <Button
                  variant={business.status === 'active' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStatus('active')}
                  disabled={updating}
                >
                  Aktif
                </Button>
                <Button
                  variant={business.status === 'passive' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStatus('passive')}
                  disabled={updating}
                >
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
            <CardTitle>Kullanıcı İşlemleri</CardTitle>
            <CardDescription>
              Bu işletmeye ait kullanıcıları yönetin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>Yeni Kullanıcı Oluştur</Button>
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
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Oluşturulma</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPasswordDialog(user.id)}
                            >
                              Şifre Değiştir
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
              <div className="text-sm text-muted-foreground text-center py-4">
                Bu işletme için henüz kullanıcı oluşturulmamış
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

