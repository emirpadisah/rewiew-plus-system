'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MessageSquare, 
  Users, 
  BarChart3, 
  Shield, 
  Zap, 
  CheckCircle2,
  Mail,
  Phone,
  Instagram,
  ArrowRight
} from 'lucide-react'

// Animation hook for scroll-triggered animations
function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  return { ref, isVisible }
}

// Counter animation hook
function useCounterAnimation(end: number, duration: number = 2000, isVisible: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, end, duration])

  return count
}

// Animated Section Component
function AnimatedSection({ 
  children, 
  delay = 0,
  className = ''
}: { 
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Animated Card Component
function AnimatedCard({ 
  children, 
  delay = 0 
}: { 
  children: React.ReactNode
  delay?: number
}) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-8 scale-95'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Counter Component
function AnimatedCounter({ 
  end, 
  suffix = '',
  prefix = '',
  duration = 2000 
}: { 
  end: number
  suffix?: string
  prefix?: string
  duration?: number
}) {
  const { ref, isVisible } = useScrollAnimation()
  const count = useCounterAnimation(end, duration, isVisible)

  return (
    <div ref={ref}>
      {prefix}{count}{suffix}
    </div>
  )
}

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24 lg:py-32 relative">
        <AnimatedSection>
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-block mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fade-in">
                <Zap className="h-4 w-4" />
                WhatsApp Review Yönetim Sistemi
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl animate-fade-in-up">
              WhatsApp ile{' '}
              <span className="relative inline-block">
                <span className="text-primary relative z-10">Daha Fazla Yorum</span>
                <span className="absolute bottom-2 left-0 right-0 h-3 bg-primary/20 -z-0 transform -skew-x-12 animate-pulse"></span>
              </span>{' '}
              Alın
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Müşterilerinize otomatik olarak review linkleri gönderin, Google Maps ve 
              Tripadvisor'da görünürlüğünüzü artırın ve işletmenizin online itibarını güçlendirin.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 group relative overflow-hidden"
                onClick={() => router.push('/auth/login')}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Giriş Yap
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 bg-primary/90 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 group border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                onClick={() => {
                  window.location.href = 'mailto:info@yorumup.com?subject=YorumUp - İletişim'
                }}
              >
                <Mail className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                İletişime Geç
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24 relative">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Neden YorumUp?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              İşletmenizin online itibarını güçlendirmek için ihtiyacınız olan her şey
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: MessageSquare,
              title: 'Otomatik Mesaj Gönderimi',
              description: 'WhatsApp üzerinden müşterilerinize otomatik olarak review linkleri gönderin. Kişiselleştirilmiş mesajlar ile müşteri deneyimini artırın.',
            },
            {
              icon: Users,
              title: 'Kolay Müşteri Yönetimi',
              description: 'Tek tek veya CSV dosyası ile toplu müşteri ekleme. Müşteri bilgilerinizi kolayca yönetin ve organize edin.',
            },
            {
              icon: BarChart3,
              title: 'Detaylı İstatistikler',
              description: 'Gönderilen mesajların başarı oranlarını takip edin. Dashboard ile tüm aktivitelerinizi görüntüleyin.',
            },
            {
              icon: Shield,
              title: 'Güvenli ve Güvenilir',
              description: 'JWT tabanlı güvenli kimlik doğrulama. Rate limiting ile spam koruması. Tüm verileriniz güvende.',
            },
            {
              icon: Zap,
              title: 'Hızlı ve Kolay Kurulum',
              description: 'QR kod ile kolay WhatsApp bağlantısı. Dakikalar içinde kurulum yapın ve mesaj göndermeye başlayın.',
            },
            {
              icon: CheckCircle2,
              title: 'Özelleştirilebilir Şablonlar',
              description: 'Mesaj şablonlarınızı özelleştirin. Müşteri adı ve review linki placeholder\'ları ile kişiselleştirilmiş mesajlar oluşturun.',
            },
          ].map((feature, index) => {
            const Icon = feature.icon
            return (
              <AnimatedCard key={index} delay={index * 100}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 group cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                        <Icon className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300" />
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </AnimatedCard>
            )
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                İşletmenize Ne Sağlar?
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {[
              { value: 300, label: 'Daha Fazla Review', prefix: '+', suffix: '%' },
              { value: 250, label: 'Görünürlük Artışı', prefix: '+', suffix: '%' },
              { value: 200, label: 'Müşteri Memnuniyeti', prefix: '+', suffix: '%' },
              { value: 100, label: 'Güvenli Sistem', prefix: '', suffix: '%' },
            ].map((stat, index) => (
              <AnimatedCard key={index} delay={index * 100}>
                <div className="text-center p-8 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-all duration-300">
                  <div className="text-5xl font-bold text-primary mb-3">
                    <AnimatedCounter 
                      end={stat.value} 
                      prefix={stat.prefix} 
                      suffix={stat.suffix}
                    />
                  </div>
                  <div className="text-gray-600 text-base font-medium">{stat.label}</div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Hemen Başlayın
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Hesabınız varsa giriş yapın, yoksa bizimle iletişime geçin
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 group relative overflow-hidden"
                onClick={() => router.push('/auth/login')}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Giriş Yap
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 bg-primary/90 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 group border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                onClick={() => {
                  window.location.href = 'mailto:info@yorumup.com?subject=YorumUp - İletişim'
                }}
              >
                <Mail className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                İletişime Geç
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedSection delay={0}>
              <div>
                <h3 className="text-white font-semibold mb-4">YorumUp</h3>
                <p className="text-sm">
                  WhatsApp üzerinden müşterilerinize otomatik review linkleri gönderin 
                  ve işletmenizin online itibarını güçlendirin.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <div>
                <h3 className="text-white font-semibold mb-4">İletişim</h3>
                <div className="space-y-3 text-sm">
                  <a 
                    href="mailto:info@yorumup.com" 
                    className="flex items-center gap-2 hover:text-white transition-colors group"
                  >
                    <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    info@yorumup.com
                  </a>
                  <a 
                    href="https://wa.me/905551234567" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-white transition-colors group"
                  >
                    <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    WhatsApp ile İletişim
                  </a>
                  <a 
                    href="https://instagram.com/yorumup.comm" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-white transition-colors group"
                  >
                    <Instagram className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    @yorumup.comm
                  </a>
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <div>
                <h3 className="text-white font-semibold mb-4">Hızlı Erişim</h3>
                <div className="space-y-2 text-sm">
                  <Link 
                    href="/auth/login" 
                    className="block hover:text-white transition-colors group"
                  >
                    <span className="flex items-center gap-2">
                      Giriş Yap
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </span>
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} YorumUp. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
