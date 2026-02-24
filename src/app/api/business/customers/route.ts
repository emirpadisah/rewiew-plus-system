import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import {
  getCustomersByBusinessId,
  createCustomer,
  createCustomersBulk,
} from '@/lib/db/repositories/customers'
import { log } from '@/lib/logger'
import { z } from 'zod'

const MODULE = 'Business/Customers'

const createCustomerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format'),
})

const createCustomersBulkSchema = z.object({
  customers: z.array(createCustomerSchema),
})

export async function GET(request: Request) {
  const startTime = Date.now()
  
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'business' || !user.businessId) {
      log.api(MODULE, 'GET', '/api/business/customers', 401)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    log.debug(MODULE, 'Müşteri listesi çekiliyor', {
      businessId: user.businessId,
      search,
      limit,
      offset,
    })

    const result = await getCustomersByBusinessId(user.businessId, {
      search,
      limit,
      offset,
    })

    log.info(MODULE, 'Müşteri listesi başarıyla çekildi', {
      businessId: user.businessId,
      count: result.data.length,
      total: result.count,
      durationMs: Date.now() - startTime,
    })

    log.api(MODULE, 'GET', '/api/business/customers', 200, Date.now() - startTime)

    return NextResponse.json(result)
  } catch (error) {
    const duration = Date.now() - startTime
    log.error(MODULE, 'Müşteri listesi çekilirken hata oluştu', error, { durationMs: duration })
    log.api(MODULE, 'GET', '/api/business/customers', 500, duration)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const startTime = Date.now()
  
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'business' || !user.businessId) {
      log.api(MODULE, 'POST', '/api/business/customers', 401)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Check if it's bulk or single
    if (body.customers && Array.isArray(body.customers)) {
      const data = createCustomersBulkSchema.parse(body)
      
      log.info(MODULE, `Toplu müşteri ekleme başlatıldı`, {
        businessId: user.businessId,
        customerCount: data.customers.length,
      })

      const customers = await createCustomersBulk(
        data.customers.map((c) => ({
          ...c,
          business_id: user.businessId!,
        }))
      )

      log.info(MODULE, `${customers.length} müşteri başarıyla eklendi`, {
        businessId: user.businessId,
        addedCount: customers.length,
        durationMs: Date.now() - startTime,
      })

      log.api(MODULE, 'POST', '/api/business/customers', 201, Date.now() - startTime)
      
      return NextResponse.json({ customers }, { status: 201 })
    } else {
      const data = createCustomerSchema.parse(body)
      
      log.debug(MODULE, 'Tekil müşteri ekleme başlatıldı', {
        businessId: user.businessId,
        customerName: data.name,
      })

      const customer = await createCustomer({
        ...data,
        business_id: user.businessId!,
      })

      log.info(MODULE, 'Müşteri başarıyla eklendi', {
        businessId: user.businessId,
        customerId: customer.id,
        customerName: customer.name,
        durationMs: Date.now() - startTime,
      })

      log.api(MODULE, 'POST', '/api/business/customers', 201, Date.now() - startTime)
      
      return NextResponse.json(customer, { status: 201 })
    }
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error instanceof z.ZodError) {
      log.warn(MODULE, 'Geçersiz müşteri verisi', { errors: error.errors })
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    log.error(MODULE, 'Müşteri ekleme sırasında hata oluştu', error, { durationMs: duration })
    log.api(MODULE, 'POST', '/api/business/customers', 500, duration)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

