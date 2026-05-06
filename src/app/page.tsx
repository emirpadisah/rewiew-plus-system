'use client'

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Car,
  ChevronDown,
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
const languageOptions = ['English', 'Türkçe'] as const

const menuLinksTr = [
  { label: 'ANA SAYFA', href: '/' },
  { label: 'HAKKIMIZDA', href: '#about' },
  { label: 'SEKTÖRLER', href: '#sectors' },
  { label: 'İLETİŞİM', href: whatsappContactHref },
]

const menuLinksEn = [
  { label: 'HOME', href: '/' },
  { label: 'ABOUT', href: '#about' },
  { label: 'SECTORS', href: '#sectors' },
  { label: 'CONTACT', href: whatsappContactHref },
]

type HeroPreview = 'dashboard' | 'customers' | 'messages'
type LanguageOption = (typeof languageOptions)[number]

const heroChoices: Array<{
  benefit: string
  title: string
  description: string
  preview: HeroPreview
}> = [
  {
    benefit: '01',
    title: 'Daha fazla yorum al',
    description: 'Doğru müşteriye doğru anda WhatsApp daveti göndererek yorum dönüşlerini artır.',
    preview: 'dashboard',
  },
  {
    benefit: '02',
    title: 'Süreci tek panelde tut',
    description: 'Müşteri listesi, kategoriler, CSV aktarımı ve limitleri dağılmadan yönet.',
    preview: 'customers',
  },
  {
    benefit: '03',
    title: 'Gönderimi hızlandır',
    description: 'Şablon seç, müşterileri işaretle ve review linklerini toplu şekilde gönder.',
    preview: 'messages',
  },
]

const heroChoicesEn: Array<{
  benefit: string
  title: string
  description: string
  preview: HeroPreview
}> = [
  {
    benefit: '01',
    title: 'Get more reviews',
    description: 'Increase review responses by sending WhatsApp invites to the right customers at the right time.',
    preview: 'dashboard',
  },
  {
    benefit: '02',
    title: 'Manage everything in one panel',
    description: 'Handle customer lists, categories, CSV import and limits without losing track.',
    preview: 'customers',
  },
  {
    benefit: '03',
    title: 'Speed up sending',
    description: 'Choose a template, mark customers and send review links in bulk.',
    preview: 'messages',
  },
]

const processSteps = [
  {
    number: '01',
    title: 'Müşterilerini içeri al',
    description: 'CSV ile toplu yükle veya tek tek ekle. Kategoriler, notlar ve müşteri limitleri tek panelde düzenli kalır.',
    image: '/landing/step-customers.png',
    alt: 'YorumUp müşteri listesi ekranı',
  },
  {
    number: '02',
    title: 'WhatsApp hesabını bağla',
    description: 'QR kodu tara, bağlantı durumunu takip et ve mesaj göndermeye hazır olup olmadığını anında gör.',
    image: '/landing/step-whatsapp.png',
    alt: 'YorumUp WhatsApp bağlantısı ekranı',
  },
  {
    number: '03',
    title: 'Yorum linkini gönder',
    description: 'Şablonu seç, müşterileri işaretle ve review linklerini dakikalar içinde toplu şekilde gönder.',
    image: '/landing/step-send-message.png',
    alt: 'YorumUp mesaj gönderme ekranı',
  },
]

const processStepsEn = [
  {
    number: '01',
    title: 'Import your customers',
    description: 'Upload in bulk with CSV or add individually. Keep categories, notes and customer limits organized in one panel.',
    image: '/landing/step-customers.png',
    alt: 'YorumUp customer list screen',
  },
  {
    number: '02',
    title: 'Connect your WhatsApp',
    description: 'Scan the QR code, monitor connection status and see when you are ready to send messages.',
    image: '/landing/step-whatsapp.png',
    alt: 'YorumUp WhatsApp connection screen',
  },
  {
    number: '03',
    title: 'Send the review link',
    description: 'Pick a template, mark customers and collect review links in minutes.',
    image: '/landing/step-send-message.png',
    alt: 'YorumUp send message screen',
  },
]

const platformCards: Array<{
  eyebrow: string
  title: string
  description: string
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
    cta: 'Akışı takip et',
    image: '/landing/analytics-dashboard-photo.jpg',
    imageAlt: 'Dizüstü bilgisayar ekranında performans ve analiz grafikleri',
    icon: <TrendingUp className="h-5 w-5" />,
    stat: '94%',
    statLabel: 'başarılı gönderim',
    tags: ['Geçmiş', 'Durum', 'Rapor'],
  },
]

const platformCardsEn: Array<{
  eyebrow: string
  title: string
  description: string
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
    title: 'Grow your customer list',
    description: 'Organize your audience with CSV import, categories and customer notes in one place.',
    cta: 'Create list',
    image: '/landing/customer-workflow-photo.jpg',
    imageAlt: 'Team working with laptop for customer and workflow management',
    icon: <Users className="h-5 w-5" />,
    stat: '620',
    statLabel: 'customers in one panel',
    tags: ['CSV', 'Category', 'Limit'],
  },
  {
    eyebrow: 'Publish',
    title: 'Send WhatsApp invites',
    description: 'Pick a template, mark target customers and deliver review links via WhatsApp.',
    cta: 'Send invite',
    image: '/landing/whatsapp-message-photo.jpg',
    imageAlt: 'WhatsApp and messaging apps on a phone',
    icon: <Send className="h-5 w-5" />,
    stat: '38',
    statLabel: 'today invites',
    tags: ['Template', 'Bulk select', 'Review link'],
  },
  {
    eyebrow: 'Optimize',
    title: 'Track review responses',
    description: 'See successful and failed sends, monitor daily flow and keep the review rhythm steady.',
    cta: 'Track flow',
    image: '/landing/analytics-dashboard-photo.jpg',
    imageAlt: 'Laptop screen with performance and analytics charts',
    icon: <TrendingUp className="h-5 w-5" />,
    stat: '94%',
    statLabel: 'successful sends',
    tags: ['History', 'Status', 'Report'],
  },
]

const proofMetrics = [
  { value: '1.248', label: 'demo davet akışı', detail: 'Toplu mesaj ekranında planlanan yorum davetleri.' },
  { value: '94%', label: 'başarılı gönderim', detail: 'Gönderim geçmişinde izlenen örnek başarı oranı.' },
  { value: '38', label: 'bugünkü davet', detail: 'Günlük ritmi takip etmek için öne çıkan panel metriği.' },
  { value: '620', label: 'müşteri kaydı', detail: 'Kategori ve CSV ile yönetilen örnek müşteri havuzu.' },
]

const proofMetricsEn = [
  { value: '1,248', label: 'demo invites', detail: 'Planned review invites on the bulk message screen.' },
  { value: '94%', label: 'successful sends', detail: 'Example success rate tracked in send history.' },
  { value: '38', label: 'today invites', detail: 'Highlight metric to follow daily rhythm.' },
  { value: '620', label: 'customer records', detail: 'Sample customer pool managed with categories and CSV.' },
]

const partnerLogos = [
  { name: 'Learnova', src: '/logos/transparent/logo-01.png', alt: 'Learnova logosu' },
  { name: 'Lexington Law Firm', src: '/logos/transparent/logo-02.png', alt: 'Lexington Law Firm logosu' },
  { name: 'Ufuk Gezgin', src: '/logos/transparent/logo-03.png', alt: 'Ufuk Gezgin logosu' },
  { name: 'Iron Reign Gym', src: '/logos/transparent/logo-04.png', alt: 'Iron Reign Gym logosu' },
  { name: 'E-ticaret markası', src: '/logos/transparent/logo-05.png', alt: 'E-ticaret markası logosu' },
  { name: 'The Hearth Coffee Co.', src: '/logos/transparent/logo-06.png', alt: 'The Hearth Coffee Co. logosu' },
  { name: 'Güler Diş Kliniği', src: '/logos/transparent/logo-07.png', alt: 'Güler Diş Kliniği logosu' },
  { name: 'Keskin Berber Dükkanı', src: '/logos/transparent/logo-08.png', alt: 'Keskin Berber Dükkanı logosu' },
  { name: 'Zihin Denge', src: '/logos/transparent/logo-09.png', alt: 'Zihin Denge logosu' },
  { name: 'MiyavPati', src: '/logos/transparent/logo-10.png', alt: 'MiyavPati Veteriner Kliniği logosu' },
]

const partnerLogoRows = [
  partnerLogos,
  [
    partnerLogos[6],
    partnerLogos[8],
    partnerLogos[3],
    partnerLogos[5],
    partnerLogos[9],
    partnerLogos[4],
    partnerLogos[2],
    partnerLogos[7],
    partnerLogos[1],
    partnerLogos[0],
  ],
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

const industryTabsEn: Array<{
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
    label: 'Hotels',
    icon: <Building2 className="h-4 w-4" />,
    title: 'Collect post-stay reviews',
    description: 'Segment guests after check-out and request reviews at the right time.',
    image: '/landing/industry-hotel.jpg',
    imageAlt: 'Modern hotel reception and lobby area',
    metric: '38',
    metricLabel: 'today invites',
    benefits: ['Quick WhatsApp invite after check-out', 'Room type and guest categories', 'Daily send control'],
  },
  {
    key: 'clinics',
    label: 'Clinics',
    icon: <HeartPulse className="h-4 w-4" />,
    title: 'Make satisfied patient experiences visible',
    description: 'Collect trustworthy reviews with polite post-appointment message templates.',
    image: '/landing/industry-clinic.jpg',
    imageAlt: 'Clean and modern clinic exam room',
    metric: '94%',
    metricLabel: 'successful sends',
    benefits: ['Personal invite after appointment', 'Category by service type', 'Message history and error tracking'],
  },
  {
    key: 'auto',
    label: 'Auto services',
    icon: <Car className="h-4 w-4" />,
    title: "Don't miss reviews after delivery",
    description: 'Separate customers by maintenance, repair and inspections; send review links from one panel after delivery.',
    image: '/landing/industry-auto-service.jpg',
    imageAlt: 'Car in a modern auto service garage',
    metric: '620',
    metricLabel: 'registered customers',
    benefits: ['Service-type segmentation', 'Pre-send bulk selection', 'Real-time connection status'],
  },
  {
    key: 'beauty',
    label: 'Beauty salons',
    icon: <Sparkles className="h-4 w-4" />,
    title: 'Turn satisfaction into social proof',
    description: 'Reach customers with a warm message after service and deliver review links reliably.',
    image: '/landing/industry-beauty-salon.jpg',
    imageAlt: 'Modern beauty salon interior',
    metric: '1,248',
    metricLabel: 'demo invites',
    benefits: ['Service-based message templates', 'Persistent customer lists', 'Fast tracking and re-sends'],
  },
]

const featureCards: Array<{
  title: string
  description: string
  icon: ReactNode
}> = [
  {
    title: 'CSV aktarımı',
    description: 'Mevcut müşteri listenizi dakikalar içinde panele alın.',
    icon: <Upload className="h-5 w-5" />,
  },
  {
    title: 'Mesaj şablonları',
    description: 'Yorum davetlerini markanızın diline göre standartlaştırın.',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: 'WhatsApp bağlantısı',
    description: 'QR ile bağlanın, durumunuzu panelden takip edin.',
    icon: <Link2 className="h-5 w-5" />,
  },
  {
    title: 'Gönderim geçmişi',
    description: 'Başarılı ve başarısız mesajları aynı akışta görün.',
    icon: <History className="h-5 w-5" />,
  },
  {
    title: 'Kategori yönetimi',
    description: 'Müşterileri hizmet, şube veya önceliğe göre gruplayın.',
    icon: <Tags className="h-5 w-5" />,
  },
  {
    title: 'Limit kontrolü',
    description: 'Paket ve günlük gönderim sınırlarını net şekilde izleyin.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
]

const featureCardsEn: Array<{
  title: string
  description: string
  icon: ReactNode
}> = [
  {
    title: 'CSV import',
    description: 'Bring your existing customer list to the panel in minutes.',
    icon: <Upload className="h-5 w-5" />,
  },
  {
    title: 'Message templates',
    description: "Standardize review invites in your brand's voice.",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: 'WhatsApp connection',
    description: 'Connect via QR and monitor status from the panel.',
    icon: <Link2 className="h-5 w-5" />,
  },
  {
    title: 'Send history',
    description: 'See successful and failed messages in the same flow.',
    icon: <History className="h-5 w-5" />,
  },
  {
    title: 'Category management',
    description: 'Group customers by service, branch or priority.',
    icon: <Tags className="h-5 w-5" />,
  },
  {
    title: 'Limit control',
    description: 'Monitor package and daily send limits clearly.',
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

function LanguageSelectorBar({
  selectedLanguage,
  onLanguageChange,
  onConfirm,
  scrollProgress,
  onShellElementChange,
  texts,
}: {
  selectedLanguage: LanguageOption
  onLanguageChange: (language: LanguageOption) => void
  onConfirm: () => void
  scrollProgress: number
  onShellElementChange: (element: HTMLElement | null) => void
  texts?: {
    introCopy?: string
    chooseLabel?: string
    confirmLabel?: string
    optionSubLabelDefault?: string
    optionSubLabelAvailable?: string
  }
}) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)

  const handleConfirm = () => {
    setIsOptionsOpen(false)
    onConfirm()
  }

  return (
    <section
      ref={onShellElementChange}
      data-component="n3-multi-language"
      data-variant="top"
      className={`language-selector-shell ${isOptionsOpen ? 'is-select-expanded' : ''}`}
      style={{ '--language-scroll-progress': scrollProgress } as CSSProperties}
      aria-label="Language selector"
    >
      <div className="language-fixed-wrapper" data-ref="fixed-wrapper">
        <div className="language-intro-container" data-ref="intro-container">
          <p className="language-intro-copy">{texts?.introCopy ?? 'Choose your language'}</p>

          <div className={`language-select ${isOptionsOpen ? 'is-expanded' : ''}`} data-component="cl-m4-select">
            <div className="language-select-wrapper">
              <button
                type="button"
                className="language-select-button"
                aria-haspopup="listbox"
                aria-expanded={isOptionsOpen}
                onClick={() => setIsOptionsOpen((isOpen) => !isOpen)}
              >
                <span className="language-button-label-wrapper">
                  <span className="language-button-label">{selectedLanguage}</span>
                </span>
                <span className="language-button-icon-wrapper" aria-hidden="true">
                  <ChevronDown className="h-5 w-5" />
                </span>
              </button>

              <div className="language-options-wrapper">
                <div className="language-options-header">
                  <p>{texts?.chooseLabel ?? 'Choose your language'}</p>
                  <button
                    type="button"
                    className="language-options-close-button"
                    onClick={() => setIsOptionsOpen(false)}
                    aria-label="Close language options"
                  >
                    <ChevronDown className="h-5 w-5 rotate-180" />
                  </button>
                </div>

                <div className="language-options-scroll-container">
                  <ul className="language-select-options" role="listbox" aria-label="Choose your language">
                    {languageOptions.map((language) => (
                      <li key={language} className="language-select-option">
                        <button
                          type="button"
                          className="language-custom-select-option"
                          role="option"
                          aria-selected={selectedLanguage === language}
                          onClick={() => {
                            onLanguageChange(language)
                            setIsOptionsOpen(false)
                          }}
                        >
                          <span className="language-selected-option-indicator" aria-hidden="true" />
                          <span className="language-option-label-wrapper">
                            <span className="language-option-label">{language}</span>
                            <span className="language-option-sub-label">
                              {language === 'English'
                                ? texts?.optionSubLabelDefault ?? 'Default Language'
                                : texts?.optionSubLabelAvailable ?? 'Available language'}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="language-selector-actions">
            <PillButton onClick={handleConfirm} tone="light" className="language-confirm-pill">
              {texts?.confirmLabel ?? 'Confirm'}
            </PillButton>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroPanelPreview({ choice, language }: { choice: (typeof heroChoices)[number], language: LanguageOption }) {
  const isEn = language === 'English'

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
                [isEn ? 'Total' : 'Toplam', '1.248', 'bg-[#edf5ff]'],
                [isEn ? 'Success' : 'Başarılı', '94%', 'bg-[#e9fbf2]'],
                [isEn ? 'Today' : 'Bugün', '38', 'bg-[#fff6e6]'],
                [isEn ? 'Customer' : 'Müşteri', '620', 'bg-[#f2efff]'],
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
                <span className="text-[7px] font-bold text-[#6b778c]">{isEn ? 'Recent messages' : 'Son mesajlar'}</span>
              </div>
              {[72, 48, 88, 56].map((width, index) => (
                <div key={index} className="mb-1.5 h-1.5 rounded-full bg-[#e7edf7]">
                  <div className="h-full rounded-full bg-[#146ef5]" style={{ width: `${width}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
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
              <span className="text-[8px] font-black">{isEn ? 'Customers' : 'Müşteriler'}</span>
              <span className="ml-auto rounded-full bg-[#dff7eb] px-2 py-0.5 text-[7px] font-bold text-[#117448]">
                CSV
              </span>
            </div>
            <div className="space-y-2 p-3">
              {[
                ['Ayşe Demir', 'VIP', '#146ef5'],
                ['Mert Kaya', isEn ? 'New' : 'Yeni', '#10b981'],
                ['Selin Öz', isEn ? 'Regular' : 'Daimi', '#7a3dff'],
                ['Can Arda', isEn ? 'Cafe' : 'Kafe', '#ff6b00'],
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
      </div>
    )
  }

  return (
    <div className="webflow-preview-wrap">
      <div className="webflow-preview-shadow" />
      <div className="webflow-preview-inner">
        <div className="h-full overflow-hidden rounded-t-[2px] border border-white/45 bg-[#f8fafc] text-[#0c1324] shadow-2xl">
          <div className="flex h-8 items-center justify-between border-b border-[#d9e2ee] px-3">
            <span className="text-[8px] font-black">{isEn ? 'Message preview' : 'Mesaj önizleme'}</span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#146ef5] text-white">
              <Send className="h-2.5 w-2.5" />
            </span>
          </div>
          <div className="p-3">
            <div className="mb-3 rounded-[6px] border-2 border-dashed border-[#bed0e7] bg-[#edf4ff] p-2">
              <div className="mb-1 text-[7px] font-black text-[#5b6b82]">{isEn ? 'Sample message' : 'Örnek mesaj'}</div>
              <p className="text-[8px] font-semibold leading-snug text-[#152033]">
                {isEn ? 'Hi Deniz, would you mind sharing your experience as a review?' : 'Merhaba Deniz, deneyimini yorum olarak paylaşır mısın?'}
              </p>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-1.5">
              {['VIP', isEn ? 'New' : 'Yeni', isEn ? 'Cafe' : 'Kafe'].map((label) => (
                <span key={label} className="rounded-full bg-[#eef2f7] px-2 py-1 text-center text-[7px] font-bold text-[#42526a]">
                  {label}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-[6px] bg-[#101827] px-2.5 py-2 text-white">
              <span className="text-[8px] font-bold">{isEn ? '38 selected' : '38 seçili'}</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#3ce681]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroChoiceCard({
  choice,
  index,
  language,
}: {
  choice: (typeof heroChoices)[number]
  index: number
  language: LanguageOption
}) {
  return (
    <article
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
      <HeroPanelPreview choice={choice} language={language} />
    </article>
  )
}

function ProcessStepsSection({ language }: { language: LanguageOption }) {
  const isEn = language === 'English'
  const steps = isEn ? processStepsEn : processSteps
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
            <span>{isEn ? 'Setup in 3 steps' : '3 adımda kurulum'}</span>
            <h2>
              <span className="webflow-scroll-title-line is-first">
                {isEn ? (
                  <>
                    <span className="webflow-title-word">Collect</span>
                    <span className="webflow-title-word">more</span>
                  </>
                ) : (
                  <>
                    <span className="webflow-title-word">Daha</span>
                    <span className="webflow-title-word">fazla</span>
                    <span className="webflow-title-word">yorumu</span>
                  </>
                )}
              </span>
              <span className="webflow-scroll-title-line is-second">
                {isEn ? (
                  <>
                    <span className="webflow-title-word">reviews</span>
                    <span className="webflow-title-word">easily</span>
                  </>
                ) : (
                  <>
                    <span className="webflow-title-word">sistemli</span>
                    <span className="webflow-title-word">topla</span>
                  </>
                )}
              </span>
            </h2>
            <p>
              {isEn 
                ? 'From customer list to WhatsApp connection, sending screen to tracking process, the entire flow proceeds in one place.' 
                : 'Müşteri listesinden WhatsApp bağlantısına, gönderim ekranından takip sürecine kadar tüm akış tek yerde ilerler.'}
            </p>
          </div>

        <div className="webflow-tabs-layout">
          <div className="webflow-tabs-left">
            <div className="webflow-tabs-list" role="tablist" aria-label={isEn ? 'YorumUp usage steps' : 'YorumUp kullanım adımları'}>
              {steps.map((step, index) => {
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
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="webflow-tabs-visual" aria-live="polite">
            {steps.map((step, index) => (
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
  children,
  tone = 'dark',
}: {
  children: string
  tone?: 'dark' | 'light'
}) {
  return (
    <a href="#contact" className={`webflow-arrow-link ${tone === 'light' ? 'is-light' : ''}`}>
      <RollingText>{children}</RollingText>
      <span aria-hidden="true">
        <ArrowRight className="h-4 w-4" />
      </span>
    </a>
  )
}

function PlatformCardsSection({ language }: { language: LanguageOption }) {
  const isEn = language === 'English'
  const cards = isEn ? platformCardsEn : platformCards

  return (
    <section id="about" data-header-tone="light" className="webflow-continuation-section webflow-platform-section">
      <div className="webflow-section-inner">
        <div className="webflow-section-heading webflow-scroll-reveal">
          <span className="webflow-section-kicker">{isEn ? 'Review collection system' : 'Yorum toplama sistemi'}</span>
          <h2>{isEn ? 'Collect every review without leaving it to chance.' : 'Her yorumu rastlantıya bırakmadan topla.'}</h2>
          <p>
            {isEn 
              ? 'YorumUp allows you to systematically record your customers, send review invites via WhatsApp, and track the entire sending process from a single panel.' 
              : 'YorumUp, müşterilerinizi düzenli şekilde kaydetmenizi, WhatsApp üzerinden yorum daveti göndermenizi ve tüm gönderim sürecini tek panelden takip etmenizi sağlar.'}
          </p>
        </div>

        <div className="webflow-platform-grid">
          {cards.map((card, index) => (
            <article
              key={card.title}
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
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function LogoMarqueeSection({ language }: { language: LanguageOption }) {
  const isEn = language === 'English'
  const headerWords = isEn 
    ? ['Customer', 'experiences', 'turning', 'into', 'reviews', 'in', 'every', 'sector.']
    : ['Her', 'sektörde', 'yoruma', 'dönüşen', 'müşteri', 'deneyimleri.']

  return (
    <section data-header-tone="light" className="webflow-logo-section">
      <div className="webflow-section-inner">
        <div className="webflow-logo-heading webflow-scroll-reveal">
          <span className="webflow-section-kicker">{isEn ? 'Businesses using YorumUp' : 'YorumUp kullanan işletmeler'}</span>
          <h2 aria-label={isEn ? 'Customer experiences turning into reviews in every sector.' : 'Her sektörde yoruma dönüşen müşteri deneyimleri.'}>
            {headerWords.map((word, index) => (
              <span key={word} style={{ animationDelay: `${index * 90}ms` }}>
                {word}
              </span>
            ))}
          </h2>
        </div>
      </div>

      <div className="webflow-logo-marquee-shell" aria-label={isEn ? 'Businesses using YorumUp' : 'YorumUp kullanan işletmeler'}>
        {partnerLogoRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`webflow-logo-marquee ${rowIndex % 2 === 1 ? 'is-reverse' : ''}`}
          >
            <div className="webflow-logo-track">
              {[...row, ...row].map((logo, index) => {
                const isDuplicate = index >= row.length

                return (
                  <span
                    key={`${logo.name}-${index}`}
                    className="webflow-logo-chip"
                    aria-hidden={isDuplicate}
                  >
                    <img
                      src={logo.src}
                      alt={isDuplicate ? '' : logo.alt}
                      loading="lazy"
                      draggable={false}
                    />
                  </span>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ProofMetricsSection({ language }: { language: LanguageOption }) {
  const isEn = language === 'English'
  const metrics = isEn ? proofMetricsEn : proofMetrics

  return (
    <section data-header-tone="dark" className="webflow-proof-section">
      <div className="webflow-section-inner">
        <div className="webflow-proof-layout">
          <div className="webflow-proof-copy webflow-scroll-reveal">
            <span className="webflow-section-kicker">{isEn ? 'Demo panel data' : 'Demo panel verileri'}</span>
            <h2>{isEn ? 'Manage your review flow with numbers.' : 'Yorum akışını rakamlarla yönet.'}</h2>
            <p>
              {isEn
                ? 'These metrics are not real customer claims; they are sample screen data showing the review invite flow tracked in the product panel.'
                : 'Metrikler gerçek müşteri iddiası değil; ürün panelinde takip edilen yorum daveti akışını anlatan örnek ekran verileridir.'}
            </p>
            <WebflowArrowLink>{isEn ? 'View panel' : 'Paneli incele'}</WebflowArrowLink>
          </div>

          <div className="webflow-metric-grid">
            {metrics.map((metric, index) => (
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

function IndustryTabsSection({ language }: { language: LanguageOption }) {
  const isEn = language === 'English'
  const tabs = isEn ? industryTabsEn : industryTabs
  const [activeIndustry, setActiveIndustry] = useState(tabs[0].key)
  const active = tabs.find((industry) => industry.key === activeIndustry) ?? tabs[0]

  return (
    <section id="sectors" data-header-tone="light" className="webflow-industries-section">
      <div className="webflow-section-inner">
        <div className="webflow-section-heading webflow-scroll-reveal">
          <span className="webflow-section-kicker">{isEn ? 'Flow by sector' : 'Sektöre göre akış'}</span>
          <h2>{isEn ? 'Every business has a different moment to ask for reviews.' : 'Her işletmenin yorum isteme anı farklı.'}</h2>
          <p>
            {isEn
              ? 'Manage the review collection rhythm of different sectors from the same panel with categories, templates, and send history.'
              : 'Kategoriler, şablonlar ve gönderim geçmişiyle farklı sektörlerin yorum toplama ritmini aynı panelden yönet.'}
          </p>
        </div>

        <div className="webflow-industry-shell webflow-scroll-reveal">
          <div className="webflow-industry-tabs" role="tablist" aria-label={isEn ? 'Sector scenarios' : 'Sektör senaryoları'}>
            {tabs.map((industry) => {
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
                <span>{isEn ? 'New review opportunity' : 'Yeni yorum fırsatı'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureGridSection({ language }: { language: LanguageOption }) {
  const isEn = language === 'English'
  const features = isEn ? featureCardsEn : featureCards

  return (
    <section data-header-tone="dark" className="webflow-features-section">
      <div className="webflow-section-inner">
        <div className="webflow-feature-heading webflow-scroll-reveal">
          <span className="webflow-section-kicker">{isEn ? 'Panel features' : 'Panel özellikleri'}</span>
          <h2>{isEn ? 'Essential pieces for the review collection operation.' : 'Yorum toplama operasyonu için gerekli parçalar.'}</h2>
          <WebflowArrowLink tone="light">{isEn ? 'See full flow' : 'Tüm akışı gör'}</WebflowArrowLink>
        </div>

        <div className="webflow-feature-grid">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="webflow-feature-card webflow-scroll-reveal"
              style={{ animationDelay: `${index * 55}ms` }}
            >
              <span className="webflow-feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCtaFooter({ demoCTA, goToPanelLabel, language }: { demoCTA: string; goToPanelLabel: string; language: LanguageOption }) {
  const isEn = language === 'English'

  return (
    <section id="contact" data-header-tone="light" className="webflow-final-section">
      <div className="webflow-section-inner">
        <div className="webflow-final-card webflow-scroll-reveal">
          <div>
            <span className="webflow-section-kicker">{isEn ? 'Start with YorumUp' : 'YorumUp ile başla'}</span>
            <h2>{isEn ? 'Start systematically collecting more reviews.' : 'Daha fazla yorumu düzenli toplamaya başla.'}</h2>
            <p>
              {isEn
                ? 'Build your customer list, connect WhatsApp, and send review links trackably from a single panel.'
                : 'Müşteri listesini kur, WhatsApp bağlantını yap ve yorum linklerini tek panelden takip edilebilir şekilde gönder.'}
            </p>
          </div>
          <div className="webflow-final-contact">
            <div className="webflow-final-socials" aria-label={isEn ? 'YorumUp contact links' : 'YorumUp iletişim bağlantıları'}>
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
                {demoCTA}
              </PillButton>
              <PillButton tone="dark" icon={<Building2 className="h-5 w-5" />}>
                {goToPanelLabel}
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
            <a href="#about">{isEn ? 'About' : 'Hakkımızda'}</a>
            <a href="#sectors">{isEn ? 'Sectors' : 'Sektörler'}</a>
            <a href={whatsappContactHref}>{isEn ? 'Contact' : 'İletişim'}</a>
          </nav>
          <span>{isEn ? 'Review collection panel via WhatsApp' : 'WhatsApp ile yorum toplama paneli'}</span>
        </footer>
      </div>
    </section>
  )
}

function LandingContinuation({ demoCTA, goToPanelLabel, language }: { demoCTA: string; goToPanelLabel: string; language: LanguageOption }) {
  return (
    <>
      <PlatformCardsSection language={language} />
      <LogoMarqueeSection language={language} />
      <ProofMetricsSection language={language} />
      <IndustryTabsSection language={language} />
      <FeatureGridSection language={language} />
      <FinalCtaFooter demoCTA={demoCTA} goToPanelLabel={goToPanelLabel} language={language} />
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
  const [isLanguageSelectorVisible, setIsLanguageSelectorVisible] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('Türkçe')
  const [isIntroVisible, setIsIntroVisible] = useState(true)
  const [isIntroLeaving, setIsIntroLeaving] = useState(false)
  const heroRef = useRef<HTMLElement | null>(null)
  const [languageShellElement, setLanguageShellElement] = useState<HTMLElement | null>(null)
  const [languageSelectorHeight, setLanguageSelectorHeight] = useState(0)
  const [languageScrollProgress, setLanguageScrollProgress] = useState(0)

  // Locale-aware datasets and small labels (Turkish is default)
  const menuLinks = selectedLanguage === 'English' ? menuLinksEn : menuLinksTr
  const localeHeroChoices = selectedLanguage === 'English' ? heroChoicesEn : heroChoices
  const localeProcessSteps = selectedLanguage === 'English' ? processStepsEn : processSteps
  const localePlatformCards = selectedLanguage === 'English' ? platformCardsEn : platformCards
  const localeProofMetrics = selectedLanguage === 'English' ? proofMetricsEn : proofMetrics
  const localeIndustryTabs = selectedLanguage === 'English' ? industryTabsEn : industryTabs
  const localeFeatureCards = selectedLanguage === 'English' ? featureCardsEn : featureCards

  const contactLabel = selectedLanguage === 'English' ? 'CONTACT' : 'İLETİŞİM'
  const menuLabel = selectedLanguage === 'English' ? 'MENU' : 'MENÜ'
  const closeLabel = selectedLanguage === 'English' ? 'CLOSE' : 'KAPAT'
  const heroTitle = selectedLanguage === 'English' ? 'More reviews, less hassle' : 'Daha fazla yorum daha az uğraş'
  const heroSubtitle = selectedLanguage === 'English'
    ? 'YorumUp helps you organize, speed up and track review invites to grow your online reputation.'
    : 'YorumUp, yorum davetlerini düzenli, hızlı ve takip edilebilir hale getirerek işletmenizin online itibarını büyütür.'
  const heroBenefitsHeading = selectedLanguage === 'English' ? '3 benefits of YorumUp' : 'YorumUp’ın 3 faydası'
  const demoCTA = selectedLanguage === 'English' ? 'Get demo' : 'Demo al'
  const fasterText = selectedLanguage === 'English' ? 'Collect reviews faster' : 'Daha hızlı yorum toplayın'
  const goToPanelLabel = selectedLanguage === 'English' ? 'Go to panel' : 'Panele git'

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
    if (!isLanguageSelectorVisible) {
      setLanguageSelectorHeight(0)
      setLanguageScrollProgress(1)
      return
    }

    const shell = languageShellElement

    if (!shell) {
      return
    }

    const updateHeight = () => {
      setLanguageSelectorHeight(shell.getBoundingClientRect().height)
    }
    const resizeObserver = new ResizeObserver(updateHeight)

    updateHeight()
    resizeObserver.observe(shell)
    window.addEventListener('resize', updateHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateHeight)
    }
  }, [isLanguageSelectorVisible, languageShellElement])

  useEffect(() => {
    if (!isLanguageSelectorVisible) {
      return
    }

    let frame = 0

    const updateScrollProgress = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const height = languageShellElement?.getBoundingClientRect().height || languageSelectorHeight || 1
        const progress = Math.min(Math.max(window.scrollY / height, 0), 1)

        setLanguageScrollProgress(progress)
      })
    }

    updateScrollProgress()
    window.addEventListener('scroll', updateScrollProgress, { passive: true })
    window.addEventListener('resize', updateScrollProgress)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateScrollProgress)
      window.removeEventListener('resize', updateScrollProgress)
    }
  }, [isLanguageSelectorVisible, languageSelectorHeight, languageShellElement])

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

  const languageSelectorOffset = isLanguageSelectorVisible
    ? Math.max(languageSelectorHeight * (1 - languageScrollProgress), 0)
    : 0

  return (
    <main className="min-h-screen overflow-x-clip bg-[#090b0d] text-white">
      {isIntroVisible ? <SiteEntryLoader isLeaving={isIntroLeaving} /> : null}

      {isLanguageSelectorVisible ? (
        <LanguageSelectorBar
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          onConfirm={() => setIsLanguageSelectorVisible(false)}
          scrollProgress={languageScrollProgress}
          onShellElementChange={setLanguageShellElement}
          texts={{
            introCopy: selectedLanguage === 'English' ? 'Choose your language' : 'Dil seçin',
            chooseLabel: selectedLanguage === 'English' ? 'Choose your language' : 'Dil seçin',
            confirmLabel: selectedLanguage === 'English' ? 'Confirm' : 'Onayla',
            optionSubLabelDefault: selectedLanguage === 'English' ? 'Default language' : 'Varsayılan dil',
            optionSubLabelAvailable: selectedLanguage === 'English' ? 'Available language' : 'Mevcut dil',
          }}
        />
      ) : null}

      <header
        className="pointer-events-none fixed inset-x-0 z-[80] px-5 py-5 transition-[top] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-8"
        style={{ top: `${languageSelectorOffset}px` }}
      >
        <nav className="mx-auto flex max-w-[1480px] items-center justify-between">
          <a
            href="/"
            className="group pointer-events-auto flex items-center"
            aria-label="YorumUp.com ana sayfa"
          >
            <span className="flex h-8 w-[min(54vw,13rem)] items-center transition duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-0.5 sm:h-9">
              <img
                src="/logo.png"
                alt=""
                className="h-full w-full object-contain drop-shadow-[0_3px_10px_rgba(0,0,0,0.38)]"
                draggable={false}
              />
            </span>
          </a>

          <div
            className={`flex items-center gap-3 transition-opacity duration-300 ${
              isMenuOpen ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
            }`}
          >
            <span className="hidden sm:inline-flex">
              <PillButton href={whatsappContactHref} tone="dark">
                {contactLabel}
              </PillButton>
            </span>
            <PillButton onClick={() => setIsMenuOpen(true)} tone="light" icon={<Menu className="h-5 w-5" />}>
              {menuLabel}
            </PillButton>
          </div>
        </nav>
      </header>

      <div
        aria-hidden={!isMenuOpen}
        className={`language-aware-menu fixed right-4 z-[70] max-h-[calc(100dvh-6rem)] w-[min(calc(100vw-2rem),360px)] overflow-y-auto overscroll-contain rounded-[16px] transition-[clip-path,opacity,transform,top] duration-[780ms] ease-[cubic-bezier(0.76,0,0.24,1)] [scrollbar-width:none] sm:right-8 sm:max-h-[calc(100dvh-3rem)] ${
          isMenuOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
        style={{
          clipPath: isMenuOpen ? 'circle(145% at calc(100% - 40px) 28px)' : 'circle(0% at calc(100% - 40px) 28px)',
          '--language-selector-offset': `${languageSelectorOffset}px`,
        } as CSSProperties}
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
              {contactLabel}
            </PillButton>
            <PillButton
              onClick={() => setIsMenuOpen(false)}
              tone="light"
              icon={<MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3} />}
              className="w-full !h-11 px-3 !text-sm sm:!h-12 sm:px-4 sm:!text-sm"
            >
              {closeLabel}
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
            href="/auth/login"
            onClick={() => setIsMenuOpen(false)}
            className={`group flex h-[72px] items-center justify-between rounded-[9px] bg-black px-6 text-white shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#111] sm:h-[82px] sm:px-7 ${
              isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: isMenuOpen ? '480ms' : '0ms' }}
          >
            <div className="flex items-center">
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
        className="webflow-hero relative min-h-[100svh] overflow-hidden border border-white/10 bg-[#050608] text-white lg:h-[100svh]"
        aria-label="YorumUp hero"
        onPointerMove={handleHeroPointerMove}
      >
        <div className="webflow-hero-base" />
        <div className="webflow-hero-fluted" />
        <div className="webflow-hero-grid" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-[90%] max-w-[112rem] flex-col pb-6 pt-24 sm:pb-8 sm:pt-28 lg:h-full lg:min-h-0 lg:pb-12 lg:pt-28 xl:pt-32">
          <div className="mx-auto max-w-[65rem] text-center">
            <h1 className="webflow-reveal-large webflow-hero-title text-white">
              {heroTitle}
            </h1>
            <p className="webflow-reveal-small mx-auto mt-6 max-w-[50rem] text-[1.1rem] font-semibold leading-[1.5] text-white/78 lg:text-xl">
              {heroSubtitle}
            </p>
          </div>

          <div className="mt-auto">
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 lg:mb-7 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="webflow-reveal-small text-base font-semibold leading-[1.2] text-white sm:text-lg">
                {heroBenefitsHeading}
              </h2>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="webflow-reveal-small text-base font-semibold leading-[1.2] text-white/88 sm:text-lg">
                  {fasterText}
                </span>
                <a
                  href={mailContactHref}
                  className="webflow-reveal-small inline-flex min-h-10 items-center justify-center rounded-[4px] bg-[#146ef5] px-4 py-2 text-base font-semibold leading-[1.2] text-white transition duration-300 hover:bg-[#0055d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  {demoCTA}
                </a>
              </div>
            </div>

            <div className="grid grid-flow-col auto-cols-[minmax(17.5rem,1fr)] gap-4 overflow-x-auto pb-2 [scrollbar-width:none] lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible lg:pb-0 xl:gap-5">
              {localeHeroChoices.map((choice, index) => (
                <HeroChoiceCard key={choice.title} choice={choice} index={index} language={selectedLanguage} />
              ))}
            </div>
          </div>
        </div>
      </section>
      <ProcessStepsSection language={selectedLanguage} />
      <LandingContinuation demoCTA={demoCTA} goToPanelLabel={goToPanelLabel} language={selectedLanguage} />
    </main>
  )
}
