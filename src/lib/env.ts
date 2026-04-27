export function getOptionalServerEnv(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

export function getRequiredServerEnv(name: string): string {
  const value = getOptionalServerEnv(name)

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`)
  }

  return value
}

export function getRequestBaseUrl(request?: Request): string {
  const configuredBaseUrl =
    getOptionalServerEnv('APP_URL') ||
    getOptionalServerEnv('NEXT_PUBLIC_APP_URL') ||
    getOptionalServerEnv('NEXT_PUBLIC_SITE_URL')

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '')
  }

  if (!request) {
    throw new Error('Unable to determine request base URL')
  }

  const requestUrl = new URL(request.url)
  const forwardedProto = request.headers
    .get('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim()
  const forwardedHost = request.headers
    .get('x-forwarded-host')
    ?.split(',')[0]
    ?.trim()
  const host = forwardedHost || request.headers.get('host')

  if (host) {
    return `${forwardedProto || requestUrl.protocol.replace(':', '')}://${host}`
  }

  return requestUrl.origin
}
