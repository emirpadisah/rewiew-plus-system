'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function BusinessNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/business" className="text-xl font-bold">
            İşletme Panel
          </Link>
          <div className="flex space-x-4">
            <Link
              href="/business"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/business'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/business/customers"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname?.startsWith('/business/customers')
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              Müşteriler
            </Link>
            <Link
              href="/business/whatsapp"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname?.startsWith('/business/whatsapp')
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              WhatsApp
            </Link>
            <Link
              href="/business/settings"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname?.startsWith('/business/settings')
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              Ayarlar
            </Link>
            <Link
              href="/business/send-message"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname?.startsWith('/business/send-message')
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              Mesaj Gönder
            </Link>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Çıkış
        </Button>
      </div>
    </nav>
  )
}

