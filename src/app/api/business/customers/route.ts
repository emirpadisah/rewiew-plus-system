import {
  createCustomer,
  createCustomersBulk,
  deleteCustomersByBusinessId,
  getCustomersByBusinessIdAndIds,
  getCustomersByBusinessId,
  updateCustomersCategory,
} from '@/lib/db/repositories/customers'
import { MAX_CUSTOMER_PACKAGE_LIMIT } from '@/lib/business-packages'
import { getBusinessLimitsSnapshot } from '@/lib/business-limits'
import { requireBusinessUser } from '@/lib/auth/guards'
import { ApiError, handleRouteError } from '@/lib/api/errors'
import { assertSameOrigin, parseListQuery } from '@/lib/api/request'
import { log } from '@/lib/logger'
import { z } from 'zod'

const MODULE = 'Business/Customers'
const PATH = '/api/business/customers'

const createCustomerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format'),
})

const createCustomersBulkSchema = z.object({
  customers: z.array(createCustomerSchema).min(1),
})

const customerIdsSchema = z.array(z.string().uuid()).min(1).max(MAX_CUSTOMER_PACKAGE_LIMIT)

const bulkUpdateCategorySchema = z.object({
  customerIds: customerIdsSchema,
  category: z.string().trim().max(100).nullable(),
})

const bulkDeleteCustomersSchema = z.object({
  customerIds: customerIdsSchema,
})

function getUniqueCustomerIds(customerIds: string[]) {
  return Array.from(new Set(customerIds))
}

async function assertCustomersBelongToBusiness(businessId: string, customerIds: string[]) {
  const customers = await getCustomersByBusinessIdAndIds(businessId, customerIds)

  if (customers.length !== customerIds.length) {
    throw new ApiError(404, 'Secilen musterilerden bazilari bulunamadi.', 'CUSTOMERS_NOT_FOUND')
  }
}

function createPackageRequiredError(limits: Awaited<ReturnType<typeof getBusinessLimitsSnapshot>>, requested: number) {
  return new ApiError(
    403,
    'Paket atanmadan musteri ekleyemezsiniz. Lutfen yoneticinizle iletisime gecin.',
    'PACKAGE_REQUIRED',
    {
      packageTier: limits.packageTier,
      limit: limits.customerLimit,
      used: limits.currentCustomerCount,
      remaining: limits.remainingCustomerSlots,
      requested,
    }
  )
}

function createCustomerLimitExceededError(
  limits: Awaited<ReturnType<typeof getBusinessLimitsSnapshot>>,
  requested: number,
  message: string
) {
  return new ApiError(409, message, 'CUSTOMER_LIMIT_EXCEEDED', {
    packageTier: limits.packageTier,
    limit: limits.customerLimit,
    used: limits.currentCustomerCount,
    remaining: limits.remainingCustomerSlots,
    requested,
  })
}

export async function GET(request: Request) {
  const startTime = Date.now()

  try {
    const user = await requireBusinessUser()
    const { search, limit, offset } = parseListQuery(request, {
      defaultLimit: 10,
      maxLimit: MAX_CUSTOMER_PACKAGE_LIMIT,
      maxSearchLength: 100,
    })

    log.debug(MODULE, 'Fetching customer list', {
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

    log.info(MODULE, 'Customer list fetched', {
      businessId: user.businessId,
      count: result.data.length,
      total: result.count,
      durationMs: Date.now() - startTime,
    })
    log.api(MODULE, 'GET', PATH, 200, Date.now() - startTime)

    return Response.json(result)
  } catch (error) {
    return handleRouteError({
      module: MODULE,
      method: 'GET',
      path: PATH,
      startTime,
      error,
    })
  }
}

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    assertSameOrigin(request)
    const user = await requireBusinessUser()

    const body = await request.json()
    const limits = await getBusinessLimitsSnapshot(user.businessId)

    if (body && Array.isArray(body.customers)) {
      const data = createCustomersBulkSchema.parse(body)
      const requested = data.customers.length

      if (!limits.packageAssigned) {
        throw createPackageRequiredError(limits, requested)
      }

      if (limits.currentCustomerCount + requested > limits.customerLimit) {
        throw createCustomerLimitExceededError(
          limits,
          requested,
          'Musteri paketi limitiniz asiliyor. Daha fazla musteri eklemek icin paketinizi yukseltin.'
        )
      }

      log.info(MODULE, 'Bulk customer creation started', {
        businessId: user.businessId,
        customerCount: requested,
      })

      const customers = await createCustomersBulk(
        data.customers.map((customer) => ({
          ...customer,
          business_id: user.businessId,
        }))
      )

      log.info(MODULE, 'Bulk customer creation completed', {
        businessId: user.businessId,
        addedCount: customers.length,
        durationMs: Date.now() - startTime,
      })
      log.api(MODULE, 'POST', PATH, 201, Date.now() - startTime)

      return Response.json({ customers }, { status: 201 })
    }

    const data = createCustomerSchema.parse(body)

    if (!limits.packageAssigned) {
      throw createPackageRequiredError(limits, 1)
    }

    if (limits.currentCustomerCount >= limits.customerLimit) {
      throw createCustomerLimitExceededError(
        limits,
        1,
        'Musteri paketi limitinize ulastiniz. Yeni musteri eklemek icin paketinizi yukseltin.'
      )
    }

    log.debug(MODULE, 'Single customer creation started', {
      businessId: user.businessId,
      customerName: data.name,
    })

    const customer = await createCustomer({
      ...data,
      business_id: user.businessId,
    })

    log.info(MODULE, 'Customer created', {
      businessId: user.businessId,
      customerId: customer.id,
      customerName: customer.name,
      durationMs: Date.now() - startTime,
    })
    log.api(MODULE, 'POST', PATH, 201, Date.now() - startTime)

    return Response.json(customer, { status: 201 })
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

export async function PATCH(request: Request) {
  const startTime = Date.now()

  try {
    assertSameOrigin(request)
    const user = await requireBusinessUser()

    const body = await request.json()
    const data = bulkUpdateCategorySchema.parse(body)
    const customerIds = getUniqueCustomerIds(data.customerIds)
    const category = data.category ? data.category : null

    await assertCustomersBelongToBusiness(user.businessId, customerIds)

    log.info(MODULE, 'Bulk customer category update started', {
      businessId: user.businessId,
      customerCount: customerIds.length,
      category,
    })

    const customers = await updateCustomersCategory(user.businessId, customerIds, category)

    log.info(MODULE, 'Bulk customer category update completed', {
      businessId: user.businessId,
      updatedCount: customers.length,
      durationMs: Date.now() - startTime,
    })
    log.api(MODULE, 'PATCH', PATH, 200, Date.now() - startTime)

    return Response.json({ customers, updatedCount: customers.length })
  } catch (error) {
    return handleRouteError({
      module: MODULE,
      method: 'PATCH',
      path: PATH,
      startTime,
      error,
    })
  }
}

export async function DELETE(request: Request) {
  const startTime = Date.now()

  try {
    assertSameOrigin(request)
    const user = await requireBusinessUser()

    const body = await request.json()
    const data = bulkDeleteCustomersSchema.parse(body)
    const customerIds = getUniqueCustomerIds(data.customerIds)

    await assertCustomersBelongToBusiness(user.businessId, customerIds)

    log.info(MODULE, 'Bulk customer deletion started', {
      businessId: user.businessId,
      customerCount: customerIds.length,
    })

    let deletedCount = 0
    try {
      deletedCount = await deleteCustomersByBusinessId(user.businessId, customerIds)
    } catch (error: any) {
      if (error?.code === '23503') {
        throw new ApiError(
          409,
          'Secilen musterilerden bazilarinin mesaj gecmisi oldugu icin silme islemi tamamlanamadi.',
          'CUSTOMER_DELETE_CONFLICT'
        )
      }

      throw error
    }

    log.info(MODULE, 'Bulk customer deletion completed', {
      businessId: user.businessId,
      deletedCount,
      durationMs: Date.now() - startTime,
    })
    log.api(MODULE, 'DELETE', PATH, 200, Date.now() - startTime)

    return Response.json({ deletedCount })
  } catch (error) {
    return handleRouteError({
      module: MODULE,
      method: 'DELETE',
      path: PATH,
      startTime,
      error,
    })
  }
}
