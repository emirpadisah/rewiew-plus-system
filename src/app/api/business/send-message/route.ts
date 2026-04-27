import {
  getCustomersByBusinessIdAndIds,
  updateCustomerLastMessageAt,
} from '@/lib/db/repositories/customers'
import { getWhatsAppConnectionByBusinessId } from '@/lib/db/repositories/whatsapp-connections'
import { getBusinessSettings } from '@/lib/db/repositories/business-settings'
import { createMessageLog } from '@/lib/db/repositories/message-logs'
import { sendTextMessage } from '@/lib/evolution/client'
import {
  getDefaultMessageTemplate,
  getMessageTemplateById,
} from '@/lib/db/repositories/message-templates'
import { getBusinessLimitsSnapshot } from '@/lib/business-limits'
import { requireBusinessUser } from '@/lib/auth/guards'
import { ApiError, handleRouteError } from '@/lib/api/errors'
import { assertSameOrigin } from '@/lib/api/request'
import { log } from '@/lib/logger'
import { z } from 'zod'

const MODULE = 'Business/SendMessage'
const PATH = '/api/business/send-message'
const MAX_CONCURRENCY = 2
const MIN_DELAY_MS = 2000
const MAX_DELAY_MS = 5000
const BATCH_DELAY_MS = 10000

const sendMessageSchema = z.object({
  customerIds: z.array(z.string().min(1)).min(1),
  templateId: z.string().optional(),
})

function randomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function createPackageRequiredError(
  limits: Awaited<ReturnType<typeof getBusinessLimitsSnapshot>>,
  requested: number
) {
  return new ApiError(
    403,
    'Paket atanmadan mesaj gonderemezsiniz. Lutfen yoneticinizle iletisime gecin.',
    'PACKAGE_REQUIRED',
    {
      packageTier: limits.packageTier,
      limit: limits.dailyMessageLimit,
      used: limits.usedToday,
      remaining: limits.remainingToday,
      requested,
    }
  )
}

function createDailyLimitError(
  limits: Awaited<ReturnType<typeof getBusinessLimitsSnapshot>>,
  requested: number,
  message: string
) {
  return new ApiError(409, message, 'DAILY_MESSAGE_LIMIT_EXCEEDED', {
    packageTier: limits.packageTier,
    limit: limits.dailyMessageLimit,
    used: limits.usedToday,
    remaining: limits.remainingToday,
    requested,
  })
}

function getSafeDeliveryErrorMessage(error: unknown) {
  const rawMessage = error instanceof Error ? error.message.toLowerCase() : ''

  if (rawMessage.includes('number') || rawMessage.includes('phone')) {
    return 'Gecersiz telefon numarasi'
  }

  return 'Mesaj gonderilemedi'
}

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    assertSameOrigin(request)
    const user = await requireBusinessUser()

    log.debug(MODULE, 'Starting message send request', {
      businessId: user.businessId,
    })

    const body = await request.json()
    const { customerIds, templateId } = sendMessageSchema.parse(body)
    const uniqueCustomerIds = [...new Set(customerIds)]

    const limits = await getBusinessLimitsSnapshot(user.businessId)

    if (!limits.packageAssigned) {
      throw createPackageRequiredError(limits, uniqueCustomerIds.length)
    }

    if (uniqueCustomerIds.length > limits.remainingToday) {
      throw createDailyLimitError(
        limits,
        uniqueCustomerIds.length,
        'Gunluk mesaj limitiniz asiliyor. Daha fazla gonderim icin paketinizi yukseltin veya yarini bekleyin.'
      )
    }

    const connection = await getWhatsAppConnectionByBusinessId(user.businessId)
    if (!connection || connection.status !== 'connected') {
      throw new ApiError(400, 'WhatsApp not connected', 'WHATSAPP_NOT_CONNECTED')
    }

    const instanceName = connection.instance_name

    const settings = await getBusinessSettings(user.businessId)
    if (!settings?.review_url) {
      throw new ApiError(
        400,
        'Review URL yapilandirilmamis. Lutfen ayarlar sayfasindan review URL ekleyin.',
        'BUSINESS_SETTINGS_INCOMPLETE'
      )
    }

    const reviewUrl = settings.review_url

    const customers = await getCustomersByBusinessIdAndIds(user.businessId, uniqueCustomerIds)

    if (customers.length === 0) {
      throw new ApiError(400, 'No customers found', 'NO_CUSTOMERS_FOUND')
    }

    if (customers.length > limits.remainingToday) {
      throw createDailyLimitError(
        limits,
        customers.length,
        'Gunluk mesaj limitiniz asiliyor. Secimi azaltip tekrar deneyin.'
      )
    }

    log.info(MODULE, 'Message send batch started', {
      businessId: user.businessId,
      customerCount: customers.length,
      connection: connection.instance_name,
    })

    let messageTemplate =
      settings.message_template ||
      'Merhaba {firstName}, bizimle deneyiminizi degerlendirmek ister misiniz? {reviewUrl}'

    if (templateId) {
      const selectedTemplate = await getMessageTemplateById(templateId)
      if (selectedTemplate && selectedTemplate.business_id === user.businessId) {
        messageTemplate = selectedTemplate.template
      }
    } else {
      const defaultTemplate = await getDefaultMessageTemplate(user.businessId)
      if (defaultTemplate) {
        messageTemplate = defaultTemplate.template
      }
    }

    const results: Array<{ customerId: string; success: boolean; error?: string }> = []
    const queue = [...customers]
    let activeCount = 0
    let processedCount = 0

    async function processQueue() {
      while (queue.length > 0 || activeCount > 0) {
        if (activeCount < MAX_CONCURRENCY && queue.length > 0) {
          const customer = queue.shift()!
          activeCount++
          processedCount += 1
          const currentProcessedCount = processedCount

          void (async () => {
            try {
              await sleep(randomDelay())

              if (currentProcessedCount % 5 === 0) {
                await sleep(BATCH_DELAY_MS)
              }

              const firstName = customer.name.split(' ')[0]
              const message = messageTemplate
                .replace(/{firstName}/g, firstName)
                .replace(/{reviewUrl}/g, reviewUrl)

              const sendStartTime = Date.now()
              await sendTextMessage(instanceName, customer.phone, message)

              log.whatsapp(
                MODULE,
                `Message sent to ${customer.name}`,
                customer.id,
                Date.now() - sendStartTime
              )

              await createMessageLog({
                business_id: user.businessId,
                customer_id: customer.id,
                status: 'sent',
              })

              await updateCustomerLastMessageAt(customer.id)
              results.push({ customerId: customer.id, success: true })
            } catch (error) {
              const safeErrorMessage = getSafeDeliveryErrorMessage(error)

              log.error(MODULE, 'Message delivery failed', error, {
                businessId: user.businessId,
                customerId: customer.id,
                customerPhone: customer.phone,
              })

              await createMessageLog({
                business_id: user.businessId,
                customer_id: customer.id,
                status: 'failed',
                error_message: safeErrorMessage,
              })

              results.push({
                customerId: customer.id,
                success: false,
                error: safeErrorMessage,
              })
            } finally {
              activeCount--
            }
          })()
        } else {
          await sleep(100)
        }
      }
    }

    await processQueue()

    const successCount = results.filter((result) => result.success).length
    const failedCount = results.filter((result) => !result.success).length
    const totalDuration = Date.now() - startTime

    log.info(MODULE, 'Message send batch completed', {
      businessId: user.businessId,
      totalCustomers: customers.length,
      successful: successCount,
      failed: failedCount,
      totalDurationMs: totalDuration,
      averagePerMessage: Math.round(totalDuration / customers.length),
    })
    log.api(MODULE, 'POST', PATH, 200, totalDuration)

    return Response.json({
      success: true,
      total: results.length,
      sent: successCount,
      failed: failedCount,
      results,
    })
  } catch (error) {
    return handleRouteError({
      module: MODULE,
      method: 'POST',
      path: PATH,
      startTime,
      error,
    })
  }
}
