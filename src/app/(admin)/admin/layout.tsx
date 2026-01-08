import { AdminNav } from '@/components/admin-nav'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</main>
    </div>
  )
}

