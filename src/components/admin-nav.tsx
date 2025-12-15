'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function AdminNav() {
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
          <Link href="/admin" className="text-xl font-bold">
            Admin Panel
          </Link>
          <div className="flex space-x-4">
            <Link
              href="/admin"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/admin'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/businesses"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname?.startsWith('/admin/businesses')
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              İşletmeler
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

