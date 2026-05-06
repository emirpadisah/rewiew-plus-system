import type { Metadata } from "next"
import { ArrowUpRight, MessageSquare } from "lucide-react"

const whatsappContactHref = "https://wa.me/905071331097"
const mailContactHref = "mailto:yorumup@gmail.com"

export const metadata: Metadata = {
  title: "Çerez Politikası",
  description:
    "YorumUp çerez politikası: Google Analytics, analitik çerezler, tercih saklama ve kullanıcı seçenekleri hakkında bilgi.",
  alternates: {
    canonical: "/cerez-politikasi",
  },
}

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-[#050608] text-white">
      <header className="border-b border-white/10 bg-[#050608]/95">
        <nav className="mx-auto flex max-w-[1480px] items-center justify-between px-5 py-5 sm:px-8">
          <a href="/" className="flex items-center" aria-label="YorumUp.com ana sayfa">
            <span className="flex h-8 w-[min(54vw,13rem)] items-center sm:h-9">
              <img
                src="/logo.png"
                alt="YorumUp"
                className="h-full w-full object-contain"
                draggable={false}
              />
            </span>
          </a>

          <div className="flex items-center gap-2">
            <a
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/90 sm:px-5"
            >
              Ana sayfa
            </a>
            <a
              href="/auth/login"
              className="hidden min-h-11 items-center justify-center rounded-full bg-[#242834] px-4 text-sm font-semibold text-white transition hover:bg-[#1c202a] sm:inline-flex sm:px-5"
            >
              Panel
            </a>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-5xl gap-10 px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-3xl">
          <span className="text-sm font-black uppercase tracking-[0.12em] text-[#8fb8ff]">
            YorumUp
          </span>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal sm:text-6xl">
            Çerez Politikası
          </h1>
          <p className="mt-5 text-base leading-7 text-white/70 sm:text-lg">
            Bu politika, YorumUp web sitesinde kullanılan çerezler ve benzer teknolojiler hakkında bilgi vermek için hazırlanmıştır.
          </p>
        </div>

        <div className="grid gap-5 text-sm leading-7 text-white/72 sm:text-base">
          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <h2 className="text-2xl font-semibold text-white">Kullandığımız çerez türleri</h2>
            <p className="mt-3">
              Sitede zorunlu teknik işlemler için gerekli kayıtlar ve kullanıcı onay verildiğinde analitik ölçüm çerezleri kullanılabilir. Analitik çerezler site performansını, ziyaretçi trafiğini ve sayfa kullanımını anlamamıza yardımcı olur.
            </p>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <h2 className="text-2xl font-semibold text-white">Google Analytics</h2>
            <p className="mt-3">
              Kullanıcı kabul ederse Google Analytics 4 çalışır. Bu ölçüm; sayfa görüntüleme, trafik kaynağı, cihaz türü ve genel kullanım davranışlarını anlamak için kullanılır. Kullanıcı reddederse Google Analytics etiketi yüklenmez.
            </p>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <h2 className="text-2xl font-semibold text-white">Google Ads</h2>
            <p className="mt-3">
              Google Ads dönüşüm veya yeniden pazarlama etiketi eklenirse, bu etiketler yalnızca analitik ve pazarlama çerezleri kabul edildiğinde çalışacak şekilde yapılandırılır. Şu anda Google Ads kimliği tanımlı değilse reklam etiketi yüklenmez.
            </p>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <h2 className="text-2xl font-semibold text-white">Tercihinizi nasıl yönetebilirsiniz?</h2>
            <p className="mt-3">
              Çerez bannerındaki “Kabul et” veya “Reddet” seçenekleriyle tercih belirleyebilirsiniz. Tercihiniz tarayıcınızın yerel depolama alanında saklanır. Tercihi değiştirmek için tarayıcı site verilerini temizleyebilir veya bizimle iletişime geçebilirsiniz.
            </p>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <h2 className="text-2xl font-semibold text-white">İletişim</h2>
            <p className="mt-3">
              Çerez kullanımı ve kişisel verilerle ilgili sorularınız için bize e-posta veya WhatsApp üzerinden ulaşabilirsiniz.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={mailContactHref}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                E-posta
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                href={whatsappContactHref}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#146ef5] px-4 text-sm font-semibold text-white transition hover:bg-[#0055d4]"
              >
                WhatsApp
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </section>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#eef2ff] text-[#03050a]">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-5 py-7 text-sm font-semibold text-[#03050a]/65 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <a href="/" className="inline-flex items-center gap-2 font-black text-[#03050a]">
            <MessageSquare className="h-5 w-5" />
            YorumUp
          </a>
          <nav className="flex flex-wrap gap-4">
            <a href="/#about" className="transition hover:text-[#03050a]">
              Hakkımızda
            </a>
            <a href="/#sectors" className="transition hover:text-[#03050a]">
              Sektörler
            </a>
            <a href={whatsappContactHref} className="transition hover:text-[#03050a]">
              İletişim
            </a>
            <a href="/cerez-politikasi" className="text-[#03050a]">
              Çerez Politikası
            </a>
          </nav>
          <span>WhatsApp ile yorum toplama paneli</span>
        </div>
      </footer>
    </main>
  )
}
