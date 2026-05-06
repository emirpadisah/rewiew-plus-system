import type { Metadata } from "next"
import Script from "next/script"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin", "latin-ext"] })
const siteUrl = "https://yorumup.com"
const siteName = "YorumUp"
const siteDescription =
  "YorumUp, işletmelerin WhatsApp üzerinden müşteri yorum davetleri göndermesini, müşteri listelerini yönetmesini ve gönderim performansını takip etmesini sağlayan yorum toplama panelidir."
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
const googleTagId = gaMeasurementId || googleAdsId

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "YorumUp | WhatsApp ile Yorum Toplama Paneli",
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "yorum toplama",
    "Google yorum artırma",
    "WhatsApp yorum daveti",
    "müşteri yorumu",
    "online itibar yönetimi",
    "review management",
    "WhatsApp review SaaS",
    "YorumUp",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "Business software",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["en_US"],
    url: siteUrl,
    siteName,
    title: "YorumUp | WhatsApp ile Yorum Toplama Paneli",
    description: siteDescription,
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "YorumUp logosu",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "YorumUp | WhatsApp ile Yorum Toplama Paneli",
    description: siteDescription,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        email: "yorumup@gmail.com",
        telephone: "+905071331097",
        sameAs: ["https://www.instagram.com/yorumup"],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteName,
        description: siteDescription,
        inLanguage: ["tr-TR", "en-US"],
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${siteUrl}/#software`,
        name: siteName,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: siteUrl,
        description: siteDescription,
        offers: {
          "@type": "Offer",
          priceCurrency: "TRY",
          availability: "https://schema.org/InStock",
        },
        provider: {
          "@id": `${siteUrl}/#organization`,
        },
      },
    ],
  }

  return (
    <html lang="tr">
      <body className={inter.className}>
        {googleTagId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-and-ads" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                ${gaMeasurementId ? `gtag('config', '${gaMeasurementId}');` : ""}
                ${googleAdsId ? `gtag('config', '${googleAdsId}');` : ""}
              `}
            </Script>
          </>
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
