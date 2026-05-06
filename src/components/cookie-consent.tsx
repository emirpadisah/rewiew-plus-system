"use client"

import { useEffect, useState } from "react"
import Script from "next/script"

const cookieConsentStorageKey = "yorumup-cookie-consent"
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
const googleTagId = gaMeasurementId || googleAdsId

type CookieConsentValue = "accepted" | "rejected"

export function CookieConsent() {
  const [consent, setConsent] = useState<CookieConsentValue | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const savedConsent = window.localStorage.getItem(cookieConsentStorageKey)

    if (savedConsent === "accepted" || savedConsent === "rejected") {
      setConsent(savedConsent)
    }

    setIsReady(true)
  }, [])

  const saveConsent = (value: CookieConsentValue) => {
    window.localStorage.setItem(cookieConsentStorageKey, value)
    setConsent(value)
  }

  const shouldLoadGoogleTags = isReady && consent === "accepted" && Boolean(googleTagId)
  const shouldShowBanner = isReady && consent === null && Boolean(googleTagId)

  return (
    <>
      {shouldLoadGoogleTags ? (
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

      {shouldShowBanner ? (
        <div className="fixed inset-x-3 bottom-3 z-[220] mx-auto max-w-3xl rounded-lg border border-white/15 bg-[#080a0d]/95 p-4 text-white shadow-2xl backdrop-blur sm:bottom-5 sm:flex sm:items-center sm:gap-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight sm:text-base">Çerez tercihleri</p>
            <p className="mt-1.5 text-xs leading-relaxed text-white/72 sm:text-sm">
              Site performansını ve ziyaretçi trafiğini anlamak için Google Analytics kullanıyoruz. Kabul edersen ölçüm çerezleri etkinleşir.{" "}
              <a href="/cerez-politikasi" className="font-semibold text-white underline underline-offset-4">
                Çerez Politikası
              </a>
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-0 sm:flex sm:flex-none">
            <button
              type="button"
              onClick={() => saveConsent("rejected")}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/18 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Reddet
            </button>
            <button
              type="button"
              onClick={() => saveConsent("accepted")}
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#146ef5] px-4 text-sm font-semibold text-white transition hover:bg-[#0055d4]"
            >
              Kabul et
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
