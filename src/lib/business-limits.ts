import { getBusinessPackageConfig } from '@/lib/business-packages'
import { countCustomersByBusinessId } from '@/lib/db/repositories/customers'
import { getBusinessById } from '@/lib/db/repositories/businesses'
import { countMessageLogsByBusinessIdInRange } from '@/lib/db/repositories/message-logs'
import { getTimeZoneDayRange } from '@/lib/timezone'
import { BusinessLimitsSnapshot } from '@/types'

export async function getBusinessLimitsSnapshot(
  businessId: string
): Promise<BusinessLimitsSnapshot> {
  const business = await getBusinessById(businessId)

  if (!business) {
    throw new Error('Business not found')
  }

  const packageConfig = getBusinessPackageConfig(business.package_tier)
  const currentCustomerCount = await countCustomersByBusinessId(businessId)
  const todayRange = getTimeZoneDayRange()
  const usedToday = await countMessageLogsByBusinessIdInRange(
    businessId,
    todayRange.start,
    todayRange.endExclusive
  )

  return {
    packageAssigned: Boolean(packageConfig),
    packageTier: business.package_tier,
    packageName: packageConfig?.name || null,
    customerLimit: packageConfig?.customerLimit || 0,
    currentCustomerCount,
    remainingCustomerSlots: packageConfig
      ? Math.max(packageConfig.customerLimit - currentCustomerCount, 0)
      : 0,
    dailyMessageLimit: packageConfig?.dailyMessageLimit || 0,
    usedToday,
    remainingToday: packageConfig
      ? Math.max(packageConfig.dailyMessageLimit - usedToday, 0)
      : 0,
  }
}
