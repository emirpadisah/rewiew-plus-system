'use client'

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Car,
  CheckCircle2,
  FileText,
  HeartPulse,
  History,
  Instagram,
  Link2,
  Mail,
  Menu,
  MessageCircle,
  MessageSquare,
  MoreVertical,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Tags,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react'

const whatsappContactHref = 'https://wa.me/905071331097'
const mailContactHref = 'mailto:yorumup@gmail.com'
const phoneContactHref = 'tel:+905071331097'
const instagramContactHref = 'https://www.instagram.com/yorumup'

const menuLinks = [
  { label: 'ANA SAYFA', href: '/' },
  { label: 'HAKKIMIZDA', href: '#about' },
  { label: 'SEKTÖRLER', href: '#sectors' },
  { label: 'İLETİŞİM', href: whatsappContactHref },
]

type HeroPreview = 'dashboard' | 'customers' | 'messages'

const heroChoices: Array<{
  benefit: string
  title: string
  description: string
  href: string
  preview: HeroPreview
}> = [
  {
    benefit: '01',
    title: 'Daha fazla yorum al',
    description: 'Doğru müşteriye doğru anda WhatsApp daveti göndererek yorum dönüşlerini artır.',
    href: '/business',
    preview: 'dashboard',
  },
  {
    benefit: '02',
    title: 'Süreci tek panelde tut',
    description: 'Müşteri listesi, kategoriler, CSV aktarımı ve limitleri dağılmadan yönet.',
    href: '/business/customers',
    preview: 'customers',
  },
  {
    benefit: '03',
    title: 'Gönderimi hızlandır',
    description: 'Şablon seç, müşterileri işaretle ve review linklerini toplu şekilde gönder.',
    href: '/business/send-message',
    preview: 'messages',
  },
]

const processSteps = [
  {
    number: '01',
    title: 'Müşterilerini içeri al',
    description: 'CSV ile toplu yükle veya tek tek ekle. Kategoriler, notlar ve müşteri limitleri tek panelde düzenli kalır.',
    cta: 'Müşteri listesini incele',
    image: '/landing/step-customers.png',
    alt: 'YorumUp müşteri listesi ekranı',
  },
  {
    number: '02',
    title: 'WhatsApp hesabını bağla',
    description: 'QR kodu tara, bağlantı durumunu takip et ve mesaj göndermeye hazır olup olmadığını anında gör.',
    cta: 'Bağlantı adımını gör',
    image: '/landing/step-whatsapp.png',
    alt: 'YorumUp WhatsApp bağlantısı ekranı',
  },
  {
    number: '03',
    title: 'Yorum linkini gönder',
    description: 'Şablonu seç, müşterileri işaretle ve review linklerini dakikalar içinde toplu şekilde gönder.',
    cta: 'Gönderim akışına bak',
    image: '/landing/step-send-message.png',
    alt: 'YorumUp mesaj gönderme ekranı',
  },
]

const platformCards: Array<{
  eyebrow: string
  title: string
  description: string
  href: string
  cta: string
  image: string
  imageAlt: string
  icon: ReactNode
  stat: string
  statLabel: string
  tags: string[]
}> = [
  {
    eyebrow: 'Build',
    title: 'Müşteri listesini büyüt',
    description: 'CSV aktarımı, kategoriler ve müşteri notlarıyla yorum isteyeceğin kitleyi tek yerde düzenle.',
    href: '/business/customers',
    cta: 'Listeyi oluştur',
    image: '/landing/customer-workflow-photo.jpg',
    imageAlt: 'Müşteri ve iş akışı yönetimi için dizüstü bilgisayarla çalışan ekip',
    icon: <Users className="h-5 w-5" />,
    stat: '620',
    statLabel: 'müşteri tek panelde',
    tags: ['CSV', 'Kategori', 'Limit'],
  },
  {
    eyebrow: 'Publish',
    title: 'WhatsApp davetlerini gönder',
    description: 'Şablonunu seç, hedef müşterileri işaretle ve yorum linkini doğru zamanda WhatsApp ile ilet.',
    href: '/business/send-message',
    cta: 'Davet gönder',
    image: '/landing/whatsapp-message-photo.jpg',
    imageAlt: 'Telefonda WhatsApp ve mesajlaşma uygulamaları',
    icon: <Send className="h-5 w-5" />,
    stat: '38',
    statLabel: 'bugünkü davet',
    tags: ['Şablon', 'Toplu seçim', 'Review link'],
  },
  {
    eyebrow: 'Optimize',
    title: 'Yorum dönüşlerini takip et',
    description: 'Başarılı ve başarısız gönderimleri gör, günlük akışı izle ve işletmenin yorum ritmini düzenli tut.',
    href: '/business/messages',
    cta: 'Akışı takip et',
    image: '/landing/analytics-dashboard-photo.jpg',
    imageAlt: 'Dizüstü bilgisayar ekranında performans ve analiz grafikleri',
    icon: <TrendingUp className="h-5 w-5" />,
    stat: '94%',
    statLabel: 'başarılı gönderim',
    tags: ['Geçmiş', 'Durum', 'Rapor'],
  },
]

const proofMetrics = [
  { value: '1.248', label: 'demo davet akışı', detail: 'Toplu mesaj ekranında planlanan yorum davetleri.' },
  { value: '94%', label: 'başarılı gönderim', detail: 'Gönderim geçmişinde izlenen örnek başarı oranı.' },
  { value: '38', label: 'bugünkü davet', detail: 'Günlük ritmi takip etmek için öne çıkan panel metriği.' },
  { value: '620', label: 'müşteri kaydı', detail: 'Kategori ve CSV ile yönetilen örnek müşteri havuzu.' },
]

const industryTabs: Array<{
  key: string
  label: string
  icon: ReactNode
  title: string
  description: string
  image: string
  imageAlt: string
  metric: string
  metricLabel: string
  benefits: string[]
}> = [
  {
    key: 'hotels',
    label: 'Oteller',
    icon: <Building2 className="h-4 w-4" />,
    title: 'Konaklama sonrası yorum daveti aksın',
    description: 'Check-out sonrası misafirleri segmentlere ayır, memnuniyet yorumlarını doğru zamanda iste.',
    image: '/landing/industry-hotel.jpg',
    imageAlt: 'Modern otel resepsiyonu ve lobi alanı',
    metric: '38',
    metricLabel: 'bugünkü davet',
    benefits: ['Check-out sonrası hızlı WhatsApp daveti', 'Oda tipi ve misafir kategorileri', 'Günlük gönderim kontrolü'],
  },
  {
    key: 'clinics',
    label: 'Klinikler',
    icon: <HeartPulse className="h-4 w-4" />,
    title: 'Memnun hasta deneyimini görünür hale getir',
    description: 'Randevu sonrası nazik mesaj şablonlarıyla güven veren yorumları daha düzenli topla.',
    image: '/landing/industry-clinic.jpg',
    imageAlt: 'Temiz ve modern klinik muayene odası',
    metric: '94%',
    metricLabel: 'başarılı gönderim',
    benefits: ['Randevu sonrası kişisel davet', 'Hizmet türüne göre kategori', 'Mesaj geçmişi ve hata takibi'],
  },
  {
    key: 'auto',
    label: 'Oto servisler',
    icon: <Car className="h-4 w-4" />,
    title: 'Teslimattan sonra yorumu kaçırma',
    description: 'Bakım, onarım ve ekspertiz müşterilerini ayır; teslim sonrası tek panelden yorum linki gönder.',
    image: '/landing/industry-auto-service.jpg',
    imageAlt: 'Modern oto servis garajında bakıma alınan araç',
    metric: '620',
    metricLabel: 'kayıtlı müşteri',
    benefits: ['Servis türüne göre ayrım', 'Toplu gönderim öncesi seçim', 'Bağlantı durumunu anlık görme'],
  },
  {
    key: 'beauty',
    label: 'Güzellik salonları',
    icon: <Sparkles className="h-4 w-4" />,
    title: 'Memnuniyeti sosyal kanıta dönüştür',
    description: 'İşlem sonrası müşteriye sıcak bir mesajla ulaş, yorum linkini kaybolmadan ilet.',
    image: '/landing/industry-beauty-salon.jpg',
    imageAlt: 'Modern güzellik salonu iç mekanı',
    metric: '1.248',
    metricLabel: 'demo davet',
    benefits: ['İşlem bazlı mesaj şablonları', 'Daimi müşteri listeleri', 'Hızlı takip ve tekrar gönderim'],
  },
]

const featureCards: Array<{
  title: string
  description: string
  href: string
  icon: ReactNode
}> = [
  {
    title: 'CSV aktarımı',
    description: 'Mevcut müşteri listenizi dakikalar içinde panele alın.',
    href: '/business/customers',
    icon: <Upload className="h-5 w-5" />,
  },
  {
    title: 'Mesaj şablonları',
    description: 'Yorum davetlerini markanızın diline göre standartlaştırın.',
    href: '/business/message-templates',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: 'WhatsApp bağlantısı',
    description: 'QR ile bağlanın, durumunuzu panelden takip edin.',
    href: '/business/whatsapp',
    icon: <Link2 className="h-5 w-5" />,
  },
  {
    title: 'Gönderim geçmişi',
    description: 'Başarılı ve başarısız mesajları aynı akışta görün.',
    href: '/business/messages',
    icon: <History className="h-5 w-5" />,
  },
  {
    title: 'Kategori yönetimi',
    description: 'Müşterileri hizmet, şube veya önceliğe göre gruplayın.',
    href: '/business/customers',
    icon: <Tags className="h-5 w-5" />,
  },
  {
    title: 'Limit kontrolü',
    description: 'Paket ve günlük gönderim sınırlarını net şekilde izleyin.',
    href: '/business',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
]

type PillButtonProps = {
  children?: string
  href?: string
  onClick?: () => void
  icon?: ReactNode
  tone?: 'light' | 'dark'
  className?: string
}

function RollingText({ children }: { children: string }) {
  return (
    <span className="rolling-text">
      <span className="rolling-text-line">
        {children}
      </span>
      <span className="rolling-text-line rolling-text-line-next">
        {children}
      </span>
    </span>
  )
}

function PillButton({
  children,
  href,
  onClick,
  icon,
  tone = 'light',
  className = '',
}: PillButtonProps) {
  const classes =
    tone === 'dark'
      ? 'bg-[#242834] text-white hover:bg-[#1c202a]'
      : 'bg-white text-black hover:bg-white/90'

  const content = (
    <>
      {children ? <RollingText>{children}</RollingText> : null}
      {icon}
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className={`group inline-flex h-12 min-w-0 items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap rounded-full px-4 text-sm font-semibold transition duration-300 sm:h-14 sm:gap-3 sm:px-6 sm:text-base ${classes} ${className}`}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex h-12 min-w-0 items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap rounded-full px-4 text-sm font-semibold transition duration-300 sm:h-14 sm:gap-3 sm:px-6 sm:text-base ${classes} ${className}`}
    >
      {content}
    </button>
  )
}

function HeroPanelPreview({ choice }: { choice: (typeof heroChoices)[number] }) {
  if (choice.preview === 'dashboard') {
    return (
      <div className="webflow-preview-wrap">
        <div className="webflow-preview-shadow" />
        <div className="webflow-preview-inner">
          <div className="h-full overflow-hidden rounded-t-[2px] border border-white/45 bg-[#f7f9ff] text-[#0b1220] shadow-2xl">
            <div className="flex h-7 items-center justify-between border-b border-[#dbe4f0] px-3">
              <span className="text-[8px] font-bold">YorumUp Business</span>
              <span className="h-2 w-10 rounded-full bg-[#146ef5]" />
            </div>
            <div className="grid grid-cols-2 gap-2 p-3">
              {[
                ['Toplam', '1.248', 'bg-[#edf5ff]'],
                ['Başarılı', '94%', 'bg-[#e9fbf2]'],
                ['Bugün', '38', 'bg-[#fff6e6]'],
                ['Müşteri', '620', 'bg-[#f2efff]'],
              ].map(([label, value, tone]) => (
                <div key={label} className={`rounded-[5px] p-2 ${tone}`}>
                  <div className="mb-1 text-[7px] font-semibold text-[#617089]">{label}</div>
                  <div className="text-[14px] font-black leading-none">{value}</div>
                </div>
              ))}
            </div>
            <div className="mx-3 rounded-[5px] border border-[#dce5f2] bg-white p-2">
              <div className="mb-2 flex items-center gap-1.5">
                <BarChart3 className="h-3 w-3 text-[#146ef5]" />
                <span className="text-[7px] font-bold text-[#6b778c]">Son mesajlar</span>
              </div>
              {[72, 48, 88, 56].map((width, index) => (
                <div key={index} className="mb-1.5 h-1.5 rounded-full bg-[#e7edf7]">
                  <div className="h-full rounded-full bg-[#146ef5]" style={{ width: `${width}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="webflow-circle-btn" aria-hidden="true" />
      </div>
    )
  }

  if (choice.preview === 'customers') {
    return (
      <div className="webflow-preview-wrap">
        <div className="webflow-preview-shadow" />
        <div className="webflow-preview-inner">
          <div className="h-full overflow-hidden rounded-t-[2px] border border-white/45 bg-[#f8fafc] text-[#0c1324] shadow-2xl">
            <div className="flex h-8 items-center gap-2 border-b border-[#d9e2ee] px-3">
              <span className="flex h-4 w-4 items-center justify-center rounded bg-[#146ef5] text-white">
                <Upload className="h-2.5 w-2.5" />
              </span>
              <span className="text-[8px] font-black">Müşteriler</span>
              <span className="ml-auto rounded-full bg-[#dff7eb] px-2 py-0.5 text-[7px] font-bold text-[#117448]">
                CSV
              </span>
            </div>
            <div className="space-y-2 p-3">
              {[
                ['Ayşe Demir', 'VIP', '#146ef5'],
                ['Mert Kaya', 'Yeni', '#10b981'],
                ['Selin Öz', 'Daimi', '#7a3dff'],
                ['Can Arda', 'Kafe', '#ff6b00'],
              ].map(([name, tag, color]) => (
                <div key={name} className="grid grid-cols-[12px_1fr_auto] items-center gap-2 rounded-[5px] border border-[#e4ebf5] bg-white px-2 py-1.5">
                  <span className="h-3 w-3 rounded-[3px] border border-[#c8d4e3]" />
                  <span className="text-[8px] font-bold">{name}</span>
                  <span className="rounded-full px-1.5 py-0.5 text-[6px] font-black text-white" style={{ backgroundColor: color }}>
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="webflow-circle-btn" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="webflow-preview-wrap">
      <div className="webflow-preview-shadow" />
      <div className="webflow-preview-inner">
        <div className="h-full overflow-hidden rounded-t-[2px] border border-white/45 bg-[#f8fafc] text-[#0c1324] shadow-2xl">
          <div className="flex h-8 items-center justify-between border-b border-[#d9e2ee] px-3">
            <span className="text-[8px] font-black">Mesaj önizleme</span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#146ef5] text-white">
              <Send className="h-2.5 w-2.5" />
            </span>
          </div>
          <div className="p-3">
            <div className="mb-3 rounded-[6px] border-2 border-dashed border-[#bed0e7] bg-[#edf4ff] p-2">
              <div className="mb-1 text-[7px] font-black text-[#5b6b82]">Örnek mesaj</div>
              <p className="text-[8px] font-semibold leading-snug text-[#152033]">
                Merhaba Deniz, deneyimini yorum olarak paylaşır mısın?
              </p>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-1.5">
              {['VIP', 'Yeni', 'Kafe'].map((label) => (
                <span key={label} className="rounded-full bg-[#eef2f7] px-2 py-1 text-center text-[7px] font-bold text-[#42526a]">
                  {label}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-[6px] bg-[#101827] px-2.5 py-2 text-white">
              <span className="text-[8px] font-bold">38 seçili</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#3ce681]" />
            </div>
          </div>
        </div>
      </div>
      <div className="webflow-circle-btn" aria-hidden="true" />
    </div>
  )
}

function HeroChoiceCard({
  choice,
  index,
}: {
  choice: (typeof heroChoices)[number]
  index: number
}) {
  return (
    <a
      href={choice.href}
      className="webflow-creation-card group"
      style={{ animationDelay: `${620 + index * 110}ms` }}
    >
      <div className="relative z-10 min-w-0 flex-1">
        <div>
          <div className="mb-3">
            <h3 className="text-[1.45rem] font-semibold leading-[1.12] text-white sm:text-[1.6rem] lg:text-[1.72rem]">
              {choice.title}
            </h3>
          </div>
          <p className="max-w-[17rem] whitespace-pre-line text-[1rem] font-semibold leading-[1.35] text-white/55 sm:text-[1.05rem]">
            {choice.description}
          </p>
        </div>
      </div>
      <HeroPanelPreview choice={choice} />
    </a>
  )
}

function ProcessStepsSection() {
  const [activeStep, setActiveStep] = useState(0)
  const [isTitleVisible, setIsTitleVisible] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const section = sectionRef.current

    if (!section) {
      return
    }

    const copy = section.querySelector('.webflow-tabs-copy')

    if (!copy) {
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsTitleVisible(true)
        observer.disconnect()
      }
    }, {
      rootMargin: '0px 0px -18% 0px',
      threshold: 0.24,
    })

    observer.observe(copy)

    return () => observer.disconnect()
  }, [])

  const handleStepSelect = (index: number) => {
    setActiveStep(index)
  }

  return (
    <section
      ref={sectionRef}
      id="projects"
      data-header-tone="light"
      className={`webflow-process-section ${isTitleVisible ? 'is-title-visible' : ''}`}
    >
      <div className="webflow-process-pin">
        <div className="webflow-process-container">
          <div className="webflow-tabs-copy">
            <span>3 adımda kurulum</span>
            <h2>
              <span className="webflow-scroll-title-line is-first">
                <span className="webflow-title-word">Daha</span>
                <span className="webflow-title-word">fazla</span>
                <span className="webflow-title-word">yorumu</span>
              </span>
              <span className="webflow-scroll-title-line is-second">
                <span className="webflow-title-word">sistemli</span>
                <span className="webflow-title-word">topla</span>
              </span>
            </h2>
            <p>
              Müşteri listesinden WhatsApp bağlantısına, gönderim ekranından takip sürecine kadar
              tüm akış tek yerde ilerler.
            </p>
          </div>

        <div className="webflow-tabs-layout">
          <div className="webflow-tabs-left">
            <div className="webflow-tabs-list" role="tablist" aria-label="YorumUp kullanım adımları">
              {processSteps.map((step, index) => {
                const isActive = activeStep === index

                return (
                  <div
                    key={step.number}
                    className={`webflow-tab-item ${isActive ? 'is-active' : ''}`}
                  >
                    <button
                      id={`yorumup-step-tab-${index}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`yorumup-step-panel-${index}`}
                      className="webflow-tab-button"
                      onClick={() => handleStepSelect(index)}
                    >
                      <span>{step.number}</span>
                      {step.title}
                    </button>
                    <div className="webflow-tab-panel">
                      <p>{step.description}</p>
                      <a href="/business">
                        {step.cta}
                        <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="webflow-tabs-visual" aria-live="polite">
            {processSteps.map((step, index) => (
              <figure
                key={step.image}
                id={`yorumup-step-panel-${index}`}
                role="tabpanel"
                aria-labelledby={`yorumup-step-tab-${index}`}
                className={`webflow-tabs-image ${activeStep === index ? 'is-active' : ''}`}
                aria-hidden={activeStep !== index}
              >
                <img src={step.image} alt={step.alt} loading={index === 0 ? 'eager' : 'lazy'} />
              </figure>
            ))}
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}

function WebflowArrowLink({
  href,
  children,
  tone = 'dark',
}: {
  href: string
  children: string
  tone?: 'dark' | 'light'
}) {
  return (
    <a href={href} className={`webflow-arrow-link ${tone === 'light' ? 'is-light' : ''}`}>
      <RollingText>{children}</RollingText>
      <span aria-hidden="true">
        <ArrowRight className="h-4 w-4" />
      </span>
    </a>
  )
}

function PlatformCardsSection() {
  return (
    <section id="about" data-header-tone="light" className="webflow-continuation-section webflow-platform-section">
      <div className="webflow-section-inner">
        <div className="webflow-section-heading webflow-scroll-reveal">
          <span className="webflow-section-kicker">Yorum toplama sistemi</span>
          <h2>Her yorumu rastlantıya bırakmadan topla.</h2>
          <p>
            YorumUp, müşterilerinizi düzenli şekilde kaydetmenizi, WhatsApp üzerinden yorum daveti
            göndermenizi ve tüm gönderim sürecini tek panelden takip etmenizi sağlar.
          </p>
        </div>

        <div className="webflow-platform-grid">
          {platformCards.map((card, index) => (
            <a
              key={card.title}
              href={card.href}
              className="webflow-platform-card webflow-scroll-reveal"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="webflow-platform-card-top">
                <span className="webflow-platform-icon">{card.icon}</span>
                <span>{card.eyebrow}</span>
              </div>
              <div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <div className="webflow-platform-tags">
                {card.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="webflow-platform-visual">
                <img src={card.image} alt={card.imageAlt} loading="lazy" />
              </div>
              <div className="webflow-platform-card-bottom">
                <span>
                  <strong>{card.stat}</strong>
                  {card.statLabel}
                </span>
                <span className="webflow-card-arrow" aria-hidden="true">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProofMetricsSection() {
  return (
    <section data-header-tone="dark" className="webflow-proof-section">
      <div className="webflow-section-inner">
        <div className="webflow-proof-layout">
          <div className="webflow-proof-copy webflow-scroll-reveal">
            <span className="webflow-section-kicker">Demo panel verileri</span>
            <h2>Yorum akışını rakamlarla yönet.</h2>
            <p>
              Metrikler gerçek müşteri iddiası değil; ürün panelinde takip edilen yorum daveti akışını
              anlatan örnek ekran verileridir.
            </p>
            <WebflowArrowLink href="/business">Paneli incele</WebflowArrowLink>
          </div>

          <div className="webflow-metric-grid">
            {proofMetrics.map((metric, index) => (
              <article
                key={metric.label}
                className="webflow-metric-card webflow-scroll-reveal"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
                <p>{metric.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function IndustryTabsSection() {
  const [activeIndustry, setActiveIndustry] = useState(industryTabs[0].key)
  const active = industryTabs.find((industry) => industry.key === activeIndustry) ?? industryTabs[0]

  return (
    <section id="sectors" data-header-tone="light" className="webflow-industries-section">
      <div className="webflow-section-inner">
        <div className="webflow-section-heading webflow-scroll-reveal">
          <span className="webflow-section-kicker">Sektöre göre akış</span>
          <h2>Her işletmenin yorum isteme anı farklı.</h2>
          <p>
            Kategoriler, şablonlar ve gönderim geçmişiyle farklı sektörlerin yorum toplama ritmini
            aynı panelden yönet.
          </p>
        </div>

        <div className="webflow-industry-shell webflow-scroll-reveal">
          <div className="webflow-industry-tabs" role="tablist" aria-label="Sektör senaryoları">
            {industryTabs.map((industry) => {
              const isActive = industry.key === activeIndustry

              return (
                <button
                  key={industry.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`webflow-industry-tab ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveIndustry(industry.key)}
                >
                  {industry.icon}
                  <span>{industry.label}</span>
                </button>
              )
            })}
          </div>

          <div key={active.key} className="webflow-industry-panel" role="tabpanel">
            <div className="webflow-industry-copy">
              <span>{active.metric} · {active.metricLabel}</span>
              <h3>{active.title}</h3>
              <p>{active.description}</p>
              <div className="webflow-benefit-list">
                {active.benefits.map((benefit) => (
                  <div key={benefit}>
                    <CheckCircle2 className="h-4 w-4" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            <div className="webflow-industry-visual">
              <img src={active.image} alt={active.imageAlt} loading="lazy" />
              <div className="webflow-floating-score" aria-hidden="true">
                <Star className="h-4 w-4" />
                <span>Yeni yorum fırsatı</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureGridSection() {
  return (
    <section data-header-tone="dark" className="webflow-features-section">
      <div className="webflow-section-inner">
        <div className="webflow-feature-heading webflow-scroll-reveal">
          <span className="webflow-section-kicker">Panel özellikleri</span>
          <h2>Yorum toplama operasyonu için gerekli parçalar.</h2>
          <WebflowArrowLink href="/business" tone="light">Tüm akışı gör</WebflowArrowLink>
        </div>

        <div className="webflow-feature-grid">
          {featureCards.map((feature, index) => (
            <a
              key={feature.title}
              href={feature.href}
              className="webflow-feature-card webflow-scroll-reveal"
              style={{ animationDelay: `${index * 55}ms` }}
            >
              <span className="webflow-feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="webflow-card-arrow" aria-hidden="true">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCtaFooter() {
  return (
    <section data-header-tone="light" className="webflow-final-section">
      <div className="webflow-section-inner">
        <div className="webflow-final-card webflow-scroll-reveal">
          <div>
            <span className="webflow-section-kicker">YorumUp ile başla</span>
            <h2>Daha fazla yorumu düzenli toplamaya başla.</h2>
            <p>
              Müşteri listesini kur, WhatsApp bağlantını yap ve yorum linklerini tek panelden takip
              edilebilir şekilde gönder.
            </p>
          </div>
          <div className="webflow-final-contact">
            <div className="webflow-final-socials" aria-label="YorumUp iletişim bağlantıları">
              <a href={instagramContactHref} aria-label="YorumUp Instagram">
                <Instagram className="h-4 w-4" />
                <span>yorumup.comm</span>
              </a>
              <a href={mailContactHref} aria-label="YorumUp e-posta">
                <Mail className="h-4 w-4" />
                <span>yorumupp@gmail.com</span>
              </a>
              <a href={phoneContactHref} aria-label="YorumUp telefon numarası">
                <Phone className="h-4 w-4" />
                <span>+90 507 133 10 97</span>
              </a>
              <a href={whatsappContactHref} aria-label="YorumUp WhatsApp">
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            </div>
            <div className="webflow-final-actions">
              <PillButton href={mailContactHref} tone="light" icon={<ArrowUpRight className="h-5 w-5" />}>
                Demo al
              </PillButton>
              <PillButton href="/business" tone="dark" icon={<Building2 className="h-5 w-5" />}>
                Panele git
              </PillButton>
            </div>
          </div>
        </div>

        <footer className="webflow-footer">
          <a href="/" className="webflow-footer-brand">
            <MessageSquare className="h-5 w-5" />
            YorumUp
          </a>
          <nav>
            <a href="#about">Hakkımızda</a>
            <a href="#sectors">Sektörler</a>
            <a href={whatsappContactHref}>İletişim</a>
          </nav>
          <span>WhatsApp ile yorum toplama paneli</span>
        </footer>
      </div>
    </section>
  )
}

function LandingContinuation() {
  return (
    <>
      <PlatformCardsSection />
      <ProofMetricsSection />
      <IndustryTabsSection />
      <FeatureGridSection />
      <FinalCtaFooter />
    </>
  )
}

function SiteEntryLoader({ isLeaving }: { isLeaving: boolean }) {
  return (
    <div
      className={`site-entry-loader ${isLeaving ? 'is-leaving' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="YorumUp.com yükleniyor"
    >
      <div className="site-entry-loader-word" aria-hidden="true">
        <span className="site-entry-loader-brand">yorumup</span>
        <span className="site-entry-loader-domain">.com</span>
      </div>
    </div>
  )
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isHeaderOnLight, setIsHeaderOnLight] = useState(false)
  const [isIntroVisible, setIsIntroVisible] = useState(true)
  const [isIntroLeaving, setIsIntroLeaving] = useState(false)
  const heroRef = useRef<HTMLElement | null>(null)
  const headerOnLightRef = useRef(false)

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setIsIntroLeaving(true), 1750)
    const hideTimer = window.setTimeout(() => setIsIntroVisible(false), 2350)

    return () => {
      window.clearTimeout(leaveTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  useEffect(() => {
    if (!isIntroVisible) {
      return
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isIntroVisible])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  useEffect(() => {
    const updateHeaderTone = () => {
      const headerCheckY = 96
      const tonedSection = Array.from(document.querySelectorAll<HTMLElement>('[data-header-tone]')).find((section) => {
        const rect = section.getBoundingClientRect()

        return rect.top <= headerCheckY && rect.bottom >= headerCheckY
      })
      const nextHeaderOnLight = tonedSection?.dataset.headerTone === 'light'

      if (nextHeaderOnLight !== headerOnLightRef.current) {
        headerOnLightRef.current = nextHeaderOnLight
        setIsHeaderOnLight(nextHeaderOnLight)
      }
    }

    updateHeaderTone()
    window.addEventListener('scroll', updateHeaderTone, { passive: true })
    window.addEventListener('resize', updateHeaderTone)

    return () => {
      window.removeEventListener('scroll', updateHeaderTone)
      window.removeEventListener('resize', updateHeaderTone)
    }
  }, [])

  const handleHeroPointerMove = (event: PointerEvent<HTMLElement>) => {
    const hero = heroRef.current

    if (!hero) {
      return
    }

    const rect = hero.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    hero.style.setProperty('--hero-x', `${x.toFixed(2)}%`)
    hero.style.setProperty('--hero-y', `${y.toFixed(2)}%`)
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#090b0d] text-white">
      {isIntroVisible ? <SiteEntryLoader isLeaving={isIntroLeaving} /> : null}

      <header className="pointer-events-none fixed inset-x-0 top-0 z-[80] px-5 py-5 sm:px-8">
        <nav className="mx-auto flex max-w-[1480px] items-center justify-between">
          <a
            href="/"
            className={`group pointer-events-auto flex items-center gap-3 transition-colors duration-300 ${
              isHeaderOnLight ? 'text-[#090b0d]' : 'text-white'
            }`}
            aria-label="YorumUp home"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-md transition duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:rotate-3 ${
                isHeaderOnLight ? 'bg-[#090b0d] text-white' : 'bg-white text-[#090b0d]'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-[-0.01em]">
              <RollingText>YorumUp</RollingText>
            </span>
          </a>

          <div
            className={`flex items-center gap-3 transition-opacity duration-300 ${
              isMenuOpen ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
            }`}
          >
            <span className="hidden sm:inline-flex">
              <PillButton href={whatsappContactHref} tone="dark">
                İLETİŞİM
              </PillButton>
            </span>
            <PillButton onClick={() => setIsMenuOpen(true)} tone="light" icon={<Menu className="h-5 w-5" />}>
              MENÜ
            </PillButton>
          </div>
        </nav>
      </header>

      <div
        aria-hidden={!isMenuOpen}
        className={`fixed right-4 top-20 z-[70] max-h-[calc(100dvh-6rem)] w-[min(calc(100vw-2rem),360px)] overflow-y-auto overscroll-contain rounded-[16px] transition-[clip-path,opacity,transform] duration-[780ms] ease-[cubic-bezier(0.76,0,0.24,1)] [scrollbar-width:none] sm:right-8 sm:top-6 sm:max-h-[calc(100dvh-3rem)] ${
          isMenuOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
        style={{
          clipPath: isMenuOpen ? 'circle(145% at calc(100% - 40px) 28px)' : 'circle(0% at calc(100% - 40px) 28px)',
        }}
      >
        <div className="grid gap-2 sm:gap-2.5">
          <div
            className={`grid items-center gap-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:gap-3 ${
              isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'
            }`}
            style={{
              gridTemplateColumns: 'minmax(0, 1fr) 124px',
              transitionDelay: isMenuOpen ? '130ms' : '0ms',
            }}
          >
            <PillButton
              href={whatsappContactHref}
              tone="dark"
              icon={<span className="h-1.5 w-1.5 rounded-full bg-white" />}
              className="w-full min-w-0 !h-11 px-3 !text-sm sm:!h-12 sm:px-4 sm:!text-sm"
            >
              İLETİŞİM
            </PillButton>
            <PillButton
              onClick={() => setIsMenuOpen(false)}
              tone="light"
              icon={<MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3} />}
              className="w-full !h-11 px-3 !text-sm sm:!h-12 sm:px-4 sm:!text-sm"
            >
              KAPAT
            </PillButton>
          </div>

          <section
            className={`rounded-[12px] bg-white px-6 py-6 text-black shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-7 sm:py-7 ${
              isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: isMenuOpen ? '210ms' : '0ms' }}
          >
            <nav className="grid gap-5 sm:gap-6">
              {menuLinks.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`group flex items-center justify-between text-[1.58rem] font-normal leading-none tracking-[-0.04em] text-black transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:pl-2 sm:text-[1.75rem] sm:tracking-[-0.05em] ${
                    isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}
                  style={{ transitionDelay: isMenuOpen ? `${310 + index * 60}ms` : '0ms' }}
                >
                  <RollingText>{link.label}</RollingText>
                  {index === 0 ? <span className="h-2.5 w-2.5 rounded-full bg-black" /> : null}
                </a>
              ))}
            </nav>
          </section>

          <a
            href="/business"
            onClick={() => setIsMenuOpen(false)}
            className={`group flex h-[72px] items-center justify-between rounded-[9px] bg-black px-6 text-white shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#111] sm:h-[82px] sm:px-7 ${
              isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: isMenuOpen ? '480ms' : '0ms' }}
          >
            <div className="flex items-center gap-4 sm:gap-5">
              <span className="text-[2rem] font-bold leading-none tracking-[-0.06em]">ö</span>
              <span className="text-[1.45rem] font-semibold leading-none tracking-[-0.04em] sm:text-[1.65rem] sm:tracking-[-0.05em]">
                <RollingText>PANEL</RollingText>
              </span>
            </div>
            <ArrowUpRight className="h-5 w-5 transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 sm:h-6 sm:w-6" />
          </a>
        </div>
      </div>

      <section
        ref={heroRef}
        id="hero"
        className="webflow-hero relative h-[100svh] overflow-hidden border border-white/10 bg-[#050608] text-white"
        aria-label="YorumUp hero"
        onPointerMove={handleHeroPointerMove}
      >
        <div className="webflow-hero-base" />
        <div className="webflow-hero-fluted" />
        <div className="webflow-hero-grid" />

        <div className="relative z-10 mx-auto flex h-full min-h-0 w-[90%] max-w-[112rem] flex-col pb-6 pt-24 sm:pb-8 sm:pt-28 lg:pb-12 lg:pt-28 xl:pt-32">
          <div className="mx-auto max-w-[65rem] text-center">
            <h1 className="webflow-reveal-large webflow-hero-title text-white">
              Daha fazla yorum daha az uğraş
            </h1>
            <p className="webflow-reveal-small mx-auto mt-6 max-w-[50rem] text-[1.1rem] font-semibold leading-[1.5] text-white/78 lg:text-xl">
              YorumUp, yorum davetlerini düzenli, hızlı ve takip edilebilir hale getirerek
              işletmenizin online itibarını büyütür.
            </p>
          </div>

          <div className="mt-auto">
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 lg:mb-7 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="webflow-reveal-small text-base font-semibold leading-[1.2] text-white sm:text-lg">
                YorumUp’ın 3 faydası
              </h2>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="webflow-reveal-small text-base font-semibold leading-[1.2] text-white/88 sm:text-lg">
                  Daha hızlı yorum toplayın
                </span>
                <a
                  href={mailContactHref}
                  className="webflow-reveal-small inline-flex min-h-10 items-center justify-center rounded-[4px] bg-[#146ef5] px-4 py-2 text-base font-semibold leading-[1.2] text-white transition duration-300 hover:bg-[#0055d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  Demo al
                </a>
              </div>
            </div>

            <div className="grid grid-flow-col auto-cols-[minmax(17.5rem,1fr)] gap-4 overflow-x-auto pb-2 [scrollbar-width:none] lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible lg:pb-0 xl:gap-5">
              {heroChoices.map((choice, index) => (
                <HeroChoiceCard key={choice.title} choice={choice} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>
      <ProcessStepsSection />
      <LandingContinuation />
    </main>
  )
}
