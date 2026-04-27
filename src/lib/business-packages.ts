import { BusinessPackage } from '@/types'

export interface BusinessPackageConfig {
  name: string
  customerLimit: number
  dailyMessageLimit: number
}

export const BUSINESS_PACKAGES: Record<BusinessPackage, BusinessPackageConfig> = {
  starter: {
    name: 'Başlangıç',
    customerLimit: 2000,
    dailyMessageLimit: 50,
  },
  standard: {
    name: 'Standart',
    customerLimit: 10000,
    dailyMessageLimit: 200,
  },
  pro: {
    name: 'Pro',
    customerLimit: 50000,
    dailyMessageLimit: 500,
  },
}

export const MAX_CUSTOMER_PACKAGE_LIMIT = Math.max(
  ...Object.values(BUSINESS_PACKAGES).map((config) => config.customerLimit)
)

export function getBusinessPackageConfig(
  packageTier: BusinessPackage | null | undefined
): BusinessPackageConfig | null {
  if (!packageTier) {
    return null
  }

  return BUSINESS_PACKAGES[packageTier]
}
