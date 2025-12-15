import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import {
  getCustomersByBusinessId,
  updateCustomerLastMessageAt,
} from '@/lib/db/repositories/customers'
import { getWhatsAppConnectionByBusinessId } from '@/lib/db/repositories/whatsapp-connections'
import { getBusinessSettings } from '@/lib/db/repositories/business-settings'
import { createMessageLog } from '@/lib/db/repositories/message-logs'
import { sendTextMessage } from '@/lib/evolution/client'
import { z } from 'zod'

const sendMessageSchema = z.object({
  customerIds: z.array(z.string()),
})

// Rate limiting configuration - CRITICAL: Prevents account spam/ban
// These values are carefully chosen to mimic human behavior
const MAX_CONCURRENCY = 2 // Maximum parallel messages (low to avoid spam detection)
const MIN_DELAY_MS = 2000 // Minimum delay between messages (2 seconds - safer)
const MAX_DELAY_MS = 5000 // Maximum delay between messages (5 seconds - safer)
const BATCH_DELAY_MS = 10000 // Delay between batches (10 seconds)

// Random delay function - CRITICAL: Always use random delays to avoid pattern detection
function randomDelay() {
  // Generate random delay between MIN and MAX
  // This prevents WhatsApp from detecting automated behavior
  return Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'business' || !user.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { customerIds } = sendMessageSchema.parse(body)

    // Get WhatsApp connection
    const connection = await getWhatsAppConnectionByBusinessId(user.businessId)
    
    if (!connection || connection.status !== 'connected') {
      return NextResponse.json(
        { error: 'WhatsApp not connected' },
        { status: 400 }
      )
    }

    // Get settings
    const settings = await getBusinessSettings(user.businessId)
    
    if (!settings || !settings.review_url) {
      return NextResponse.json(
        { error: 'Review URL yapılandırılmamış. Lütfen ayarlar sayfasından review URL ekleyin.' },
        { status: 400 }
      )
    }

    // Get customers
    const { data: allCustomers } = await getCustomersByBusinessId(
      user.businessId,
      { limit: 10000 }
    )
    
    const customers = allCustomers.filter((c) => customerIds.includes(c.id))

    if (customers.length === 0) {
      return NextResponse.json({ error: 'No customers found' }, { status: 400 })
    }

    // Send messages with rate limiting
    const results: Array<{ customerId: string; success: boolean; error?: string }> = []
    const queue = [...customers]
    let activeCount = 0

    async function processQueue() {
      let processedCount = 0
      
      while (queue.length > 0 || activeCount > 0) {
        if (activeCount < MAX_CONCURRENCY && queue.length > 0) {
          const customer = queue.shift()!
          activeCount++
          const currentProcessedCount = ++processedCount

          ;(async () => {
            const customerName = customer.name
            const customerPhone = customer.phone
            const customerId = customer.id
            
            try {
              // CRITICAL: Always apply random delay before sending
              // This prevents WhatsApp spam detection
              // Random delay between 2-5 seconds mimics human behavior
              const delay = randomDelay()
              await sleep(delay)
              
              // Additional batch delay every 5 messages to avoid rate limits
              // This prevents sending too many messages in quick succession
              if (currentProcessedCount % 5 === 0 && currentProcessedCount > 0) {
                await sleep(BATCH_DELAY_MS)
              }

              // Build personalized message using template
              const firstName = customerName.split(' ')[0]
              
              // Get message template or use default
              const template = settings.message_template || 'Merhaba {firstName}, bizimle deneyiminizi değerlendirmek ister misiniz? {reviewUrl}'
              
              // Replace placeholders
              const message = template
                .replace(/{firstName}/g, firstName)
                .replace(/{reviewUrl}/g, settings.review_url || '')

              await sendTextMessage(
                connection.instance_name,
                customerPhone,
                message
              )

              await createMessageLog({
                business_id: user.businessId!,
                customer_id: customerId,
                status: 'sent',
              })

              await updateCustomerLastMessageAt(customerId)

              results.push({ customerId, success: true })
            } catch (error: any) {
              const errorMessage = error.message || 'Unknown error'
              
              console.error(`Error sending message to ${customerName}:`, errorMessage)

              await createMessageLog({
                business_id: user.businessId!,
                customer_id: customerId,
                status: 'failed',
                error_message: errorMessage,
              })

              results.push({
                customerId,
                success: false,
                error: errorMessage,
              })
            } finally {
              activeCount--
            }
          })()
        } else {
          // Wait a bit before checking again
          await sleep(100)
        }
      }
    }
    
    await processQueue()

    const successCount = results.filter((r) => r.success).length
    const failedCount = results.filter((r) => !r.success).length

    if (failedCount > 0) {
      console.error(`Message sending completed: ${successCount} sent, ${failedCount} failed`)
    }

    return NextResponse.json({
      success: true,
      total: results.length,
      sent: successCount,
      failed: failedCount,
      results,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error sending messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

