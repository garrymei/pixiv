import Taro from '@tarojs/taro'
import { defaultApiMode, defaultRuntimeEnv, getEnvConfig, type ApiMode, type RuntimeEnv } from '../config/env'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

type RequestOptions = {
  requireAuth?: boolean
  retryOnAuthFailure?: boolean
  header?: Record<string, string>
}

type AuthLoginPayload = {
  mockId?: string
  nickname?: string
}

type AuthLoginResponse = {
  token: string
  user?: SessionUser
}

type RequestContext = {
  url: string
  method: HttpMethod
  data?: any
  options?: RequestOptions
  header: Record<string, string>
}

type ResponseLike<T> = {
  statusCode?: number
  data: ApiResponse<T> | T
}

type ResponseContext<T> = {
  request: RequestContext
  response: ResponseLike<T>
}

type RequestInterceptor = (context: RequestContext) => Promise<RequestContext> | RequestContext
type ResponseInterceptor = <T>(context: ResponseContext<T>) => Promise<ResponseContext<T>> | ResponseContext<T>

export type SessionUser = {
  id: number
  nickname?: string
  avatar?: string
  avatarUrl?: string
  bio?: string
  city?: string
  role_type?: string
}

const MODE_KEY = 'api_mode'
const ENV_KEY = 'runtime_env'
const TOKEN_KEY = 'auth_token'
const SESSION_USER_KEY = 'session_user'
const UNAUTHORIZED_CODE = 4002
const REQUEST_TIMEOUT = 10000

let bootstrapPromise: Promise<string> | null = null

export class RequestError extends Error {
  statusCode?: number
  code?: number
  payload?: unknown

  constructor(message: string, options?: { statusCode?: number; code?: number; payload?: unknown }) {
    super(message)
    this.name = 'RequestError'
    this.statusCode = options?.statusCode
    this.code = options?.code
    this.payload = options?.payload
  }
}

function formatBaseUrl(url: string) {
  return url.replace(/\/$/, '')
}

function joinUrl(baseUrl: string, path: string) {
  if (!path) return baseUrl
  if (/^https?:\/\//.test(path)) return path
  if (!baseUrl) return path
  return `${formatBaseUrl(baseUrl)}${path.startsWith('/') ? path : `/${path}`}`
}

export function setApiMode(next: ApiMode) {
  Taro.setStorageSync(MODE_KEY, next)
}

export function getApiMode(): ApiMode {
  const stored = Taro.getStorageSync(MODE_KEY) as ApiMode | ''
  return stored || defaultApiMode
}

export function isMockMode() {
  return getApiMode() === 'mock'
}

export function setRuntimeEnv(next: RuntimeEnv) {
  Taro.setStorageSync(ENV_KEY, next)
}

export function getRuntimeEnv(): RuntimeEnv {
  const stored = Taro.getStorageSync(ENV_KEY) as RuntimeEnv | ''
  return stored || defaultRuntimeEnv
}

export function getApiBaseUrl() {
  return getEnvConfig(getRuntimeEnv()).apiBaseUrl
}

export function getUploadBaseUrl() {
  const env = getEnvConfig(getRuntimeEnv())
  return env.uploadBaseUrl || env.apiBaseUrl
}

export function resolveApiUrl(path: string) {
  return joinUrl(getApiBaseUrl(), path)
}

export function resolveAssetUrl(url?: string) {
  if (!url) return ''
  if (/^https?:\/\//.test(url)) return url
  return joinUrl(getUploadBaseUrl(), url)
}

export function setToken(token: string) {
  Taro.setStorageSync(TOKEN_KEY, token)
}

export function getToken() {
  return Taro.getStorageSync(TOKEN_KEY) as string
}

export function clearToken() {
  Taro.removeStorageSync(TOKEN_KEY)
}

export function getSessionUser() {
  return Taro.getStorageSync(SESSION_USER_KEY) as SessionUser | null
}

export function setSessionUser(user: SessionUser | null) {
  if (!user) {
    Taro.removeStorageSync(SESSION_USER_KEY)
    return
  }
  Taro.setStorageSync(SESSION_USER_KEY, user)
}

export function clearAuthState() {
  clearToken()
  setSessionUser(null)
}

export function getAuthHeader(token?: string) {
  if (!token) return {} as Record<string, string>
  return { Authorization: `Bearer ${token}` }
}

function createRequestError(message: string, options?: { statusCode?: number; code?: number; payload?: unknown }) {
  return new RequestError(message || '请求失败', options)
}

function getDefaultStatusMessage(statusCode?: number) {
  if (statusCode === 401) return '登录状态已失效，请重新登录'
  if (statusCode === 403) return '暂无权限执行该操作'
  if (statusCode === 404) return '请求内容不存在或已下线'
  if (statusCode === 408) return '请求超时，请稍后重试'
  if (statusCode === 409) return '请勿重复提交'
  if (statusCode && statusCode >= 500) return '服务开小差了，请稍后重试'
  return ''
}

function normalizeResponseMessage(message: unknown, statusCode?: number) {
  if (Array.isArray(message)) {
    return message.filter(Boolean).join('；') || getDefaultStatusMessage(statusCode) || '请求失败'
  }

  const raw = String(message || '').trim()
  const fallback = getDefaultStatusMessage(statusCode) || '请求失败'
  if (!raw) return fallback

  if (raw === 'missing token' || raw === 'invalid token') return getDefaultStatusMessage(401)
  if (raw === 'not allow') return getDefaultStatusMessage(403)
  if (raw === 'event not found' || raw === 'demand not found') return getDefaultStatusMessage(404)
  if (raw === 'duplicate submit') return getDefaultStatusMessage(409)
  if (raw === 'internal error') return getDefaultStatusMessage(500)
  return raw
}

function getNetworkErrorMessage(error: any) {
  const raw = String(error?.errMsg || error?.message || '').toLowerCase()
  if (raw.includes('timeout')) return '网络请求超时，请稍后重试'
  if (raw.includes('fail') || raw.includes('network')) return '网络连接异常，请检查网络后重试'
  if (raw.includes('abort')) return '请求已取消'
  return ''
}

function normalizeError(error: unknown, fallbackMessage = '请求失败') {
  if (error instanceof RequestError) return error
  if (error instanceof Error) return new RequestError(error.message || fallbackMessage)
  const networkMessage = getNetworkErrorMessage(error)
  const statusCode = typeof (error as any)?.statusCode === 'number' ? (error as any).statusCode : undefined
  return new RequestError(networkMessage || getDefaultStatusMessage(statusCode) || fallbackMessage, { statusCode })
}

export function isUnauthorizedError(error: unknown) {
  const normalized = normalizeError(error)
  return normalized.statusCode === 401 || normalized.code === UNAUTHORIZED_CODE
}

export function unwrapResponseData<T>(response: ResponseLike<T>): T {
  const body = response.data
  const statusCode = response.statusCode || 200

  if (body && typeof body === 'object' && 'code' in body && 'message' in body) {
    const apiBody = body as ApiResponse<T>
    if (apiBody.code !== 0) {
      throw createRequestError(normalizeResponseMessage(apiBody.message, statusCode), {
        statusCode,
        code: apiBody.code,
        payload: apiBody.data
      })
    }
    return apiBody.data
  }

  if (statusCode >= 400) {
    throw createRequestError(getDefaultStatusMessage(statusCode) || '请求失败', { statusCode, payload: body })
  }

  return body as T
}

async function applyRequestInterceptors(context: RequestContext) {
  let next = context
  for (const interceptor of requestInterceptors) {
    next = await interceptor(next)
  }
  return next
}

async function applyResponseInterceptors<T>(context: ResponseContext<T>) {
  let next = context
  for (const interceptor of responseInterceptors) {
    next = await interceptor(next)
  }
  return next
}

async function sendRequest<T>(context: RequestContext): Promise<ResponseLike<T>> {
  const response = await Taro.request<ApiResponse<T>>({
    url: context.url,
    method: context.method,
    data: context.data,
    header: context.header,
    timeout: REQUEST_TIMEOUT
  })
  return {
    statusCode: response.statusCode,
    data: response.data
  }
}

async function login(payload: AuthLoginPayload = { mockId: 'dev' }) {
  const response = await sendRequest<AuthLoginResponse>({
    url: resolveApiUrl('/auth/login'),
    method: 'POST',
    data: payload,
    header: {
      'Content-Type': 'application/json'
    }
  })
  const data = unwrapResponseData(response)
  if (data.token) {
    setToken(data.token)
  }
  if (data.user) {
    setSessionUser(data.user)
  }
  return data
}

export async function loginByMockId(mockId = 'dev', nickname?: string) {
  if (isMockMode()) {
    return { token: '', user: getSessionUser() }
  }
  return login({ mockId, nickname })
}

async function validateToken(token: string) {
  const response = await sendRequest<{ id: number }>({
    url: resolveApiUrl('/auth/me'),
    method: 'GET',
    header: {
      ...getAuthHeader(token)
    }
  })
  return unwrapResponseData(response)
}

export async function bootstrapSession(forceRefresh = false) {
  if (isMockMode()) return ''
  if (bootstrapPromise) return bootstrapPromise

  bootstrapPromise = (async () => {
    if (forceRefresh) {
      clearAuthState()
    }

    const existing = getToken()
    if (existing) {
      try {
        const authUser = await validateToken(existing)
        const cachedUser = getSessionUser()
        if (!cachedUser || cachedUser.id !== authUser.id) {
          setSessionUser({ id: authUser.id })
        }
        return existing
      } catch {
        clearAuthState()
      }
    }

    const session = await login()
    return session.token || ''
  })().finally(() => {
    bootstrapPromise = null
  })

  return bootstrapPromise
}

export async function ensureToken(forceRefresh = false) {
  if (isMockMode()) return ''
  const existing = getToken()
  if (existing && !forceRefresh) return existing
  return bootstrapSession(forceRefresh)
}

async function request<T>(method: HttpMethod, path: string, data?: any, options?: RequestOptions): Promise<T> {
  const retryOnAuthFailure = options?.retryOnAuthFailure ?? true
  try {
    const requestContext = await applyRequestInterceptors({
      url: resolveApiUrl(path),
      method,
      data,
      options,
      header: {
        ...(method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
        ...(options?.header || {})
      }
    })

    const response = await sendRequest<T>(requestContext)
    const responseContext = await applyResponseInterceptors({ request: requestContext, response })
    return unwrapResponseData(responseContext.response)
  } catch (error) {
    const normalized = normalizeError(error)
    if (options?.requireAuth && retryOnAuthFailure && isUnauthorizedError(normalized)) {
      clearAuthState()
      await bootstrapSession(true)
      return request<T>(method, path, data, { ...options, retryOnAuthFailure: false })
    }
    throw normalized
  }
}

export async function mockResponse<T>(data: T, delayMs = 200): Promise<T> {
  await new Promise((r) => setTimeout(r, delayMs))
  return data
}

const requestInterceptors: RequestInterceptor[] = [
  async (context) => {
    if (!context.options?.requireAuth) return context
    const token = await ensureToken()
    if (!token) return context
    return {
      ...context,
      header: {
        ...context.header,
        ...getAuthHeader(token)
      }
    }
  }
]

const responseInterceptors: ResponseInterceptor[] = [
  async (context) => context
]

export function useRequestInterceptor(interceptor: RequestInterceptor) {
  requestInterceptors.push(interceptor)
}

export function useResponseInterceptor(interceptor: ResponseInterceptor) {
  responseInterceptors.push(interceptor)
}

export async function get<T>(url: string, options?: RequestOptions): Promise<T> {
  return request<T>('GET', url, undefined, options)
}

export async function post<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
  return request<T>('POST', url, data, options)
}

export async function patch<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
  return request<T>('PATCH', url, data, options)
}

export async function del<T>(url: string, options?: RequestOptions): Promise<T> {
  return request<T>('DELETE', url, undefined, options)
}
