'use client'

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { ArrowUpRight, BarChart3, CheckCircle2, Menu, MessageSquare, MoreVertical, Send, Upload } from 'lucide-react'

const menuLinks = [
  { label: 'ANA SAYFA', href: '/' },
  { label: 'HAKKIMIZDA', href: '#about' },
  { label: 'PROJELER', href: '#projects' },
  { label: 'İLETİŞİM', href: 'mailto:info@yorumup.com' },
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

  return (
    <section id="projects" className="webflow-process-section">
      <div className="webflow-process-container">
        <div className="webflow-tabs-layout">
          <div className="webflow-tabs-left">
            <div className="webflow-tabs-copy">
              <h2>Daha fazla yorumu sistemli topla</h2>
              <p>
                Müşteri listesinden WhatsApp bağlantısına, gönderim ekranından takip sürecine kadar
                tüm akış tek yerde ilerler.
              </p>
            </div>

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
                      onClick={() => setActiveStep(index)}
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
    </section>
  )
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const heroRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => window.removeEventListener('keydown', handleEscape)
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
    <main className="min-h-screen overflow-x-hidden bg-[#090b0d] text-white">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[80] px-5 py-5 sm:px-8">
        <nav className="mx-auto flex max-w-[1480px] items-center justify-between">
          <a href="/" className="group pointer-events-auto flex items-center gap-3" aria-label="YorumUp home">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-[#090b0d] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:rotate-3">
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
              <PillButton href="mailto:info@yorumup.com" tone="dark">
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
        className={`fixed right-4 top-20 z-[70] max-h-[calc(100dvh-6rem)] w-[min(calc(100vw-2rem),388px)] overflow-y-auto overscroll-contain rounded-[18px] transition-[clip-path,opacity,transform] duration-[780ms] ease-[cubic-bezier(0.76,0,0.24,1)] [scrollbar-width:none] sm:right-8 sm:top-6 sm:max-h-[calc(100dvh-3rem)] ${
          isMenuOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
        style={{
          clipPath: isMenuOpen ? 'circle(145% at calc(100% - 40px) 28px)' : 'circle(0% at calc(100% - 40px) 28px)',
        }}
      >
        <div className="grid gap-2.5 sm:gap-3">
          <div
            className={`grid items-center gap-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:gap-3 ${
              isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'
            }`}
            style={{
              gridTemplateColumns: 'minmax(0, 1fr) 112px',
              transitionDelay: isMenuOpen ? '130ms' : '0ms',
            }}
          >
            <PillButton
              href="mailto:info@yorumup.com"
              tone="dark"
              icon={<span className="h-1.5 w-1.5 rounded-full bg-white" />}
              className="w-full min-w-0 px-3 sm:px-5"
            >
              İLETİŞİM
            </PillButton>
            <PillButton
              onClick={() => setIsMenuOpen(false)}
              tone="light"
              icon={<MoreVertical className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={3} />}
              className="w-full px-0"
            >
              KAPAT
            </PillButton>
          </div>

          <section
            className={`rounded-[12px] bg-white px-8 py-7 text-black shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-10 sm:py-8 ${
              isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: isMenuOpen ? '210ms' : '0ms' }}
          >
            <nav className="grid gap-7 sm:gap-8">
              {menuLinks.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`group flex items-center justify-between text-[1.85rem] font-normal leading-none tracking-[-0.05em] text-black transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:pl-2 sm:text-[2rem] sm:tracking-[-0.06em] ${
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
            className={`group flex h-[84px] items-center justify-between rounded-[9px] bg-black px-8 text-white shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#111] sm:h-[98px] sm:px-10 ${
              isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: isMenuOpen ? '480ms' : '0ms' }}
          >
            <div className="flex items-center gap-6 sm:gap-7">
              <span className="text-[2.45rem] font-bold leading-none tracking-[-0.08em]">ö</span>
              <span className="text-[1.8rem] font-semibold leading-none tracking-[-0.055em] sm:text-[2rem] sm:tracking-[-0.06em]">
                <RollingText>PANEL</RollingText>
              </span>
            </div>
            <ArrowUpRight className="h-6 w-6 transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 sm:h-7 sm:w-7" />
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
                  href="mailto:info@yorumup.com"
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
    </main>
  )
}
