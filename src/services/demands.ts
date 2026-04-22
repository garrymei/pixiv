import Taro from '@tarojs/taro'
import { get, isMockMode, mockResponse, post, resolveAssetUrl } from './request'
import { getCachedCurrentUser } from './user'
import { mockDemands, type Demand } from '../mocks/demands'
import { currentUser } from '../mocks/user'

const DEMAND_LIST_REFRESH_KEY = 'demand_list_should_refresh'
const MY_APPLIED_DEMANDS_REFRESH_KEY = 'my_applied_demands_should_refresh'

type DemandRecord = {
  id: number
  accepted_application_id?: number | null
  accepted_user_id?: number | null
  demand_type: 'PHOTOGRAPHY' | 'MAKEUP' | 'COSER' | 'RETOUCH' | 'OTHER'
  title: string
  description?: string | null
  city?: string | null
  location?: string | null
  event_time?: number | string | null
  budget_type?: string | null
  budget_amount?: number | null
  participant_limit?: number | null
  deadline?: number | string | null
  status: 'OPEN' | 'CLOSED'
  authorId?: number
  author_id?: number
  created_at?: number | string | null
  application_count?: number | null
  schedule_status?:
    | 'pending_confirm'
    | 'accepted'
    | 'confirmed'
    | 'ongoing'
    | 'ended'
    | 'expired'
    | 'cancel_pending'
    | 'cancelled'
  schedule_status_text?: string | null
  applicant_confirmed?: boolean
  publisher_confirmed?: boolean
  application_id?: number
  user?: {
    id?: number
    nickname?: string
    avatar?: string
  }
}

type DemandListResponse = {
  list: DemandRecord[]
  total: number
}

export type ExtendedDemand = Demand & {
  deadline?: number
  participantLimit?: number
  applicationCount?: number
  scheduleStatus?:
    | 'pending_confirm'
    | 'accepted'
    | 'confirmed'
    | 'ongoing'
    | 'ended'
    | 'expired'
    | 'cancel_pending'
    | 'cancelled'
  scheduleStatusText?: string
  applicantConfirmed?: boolean
  publisherConfirmed?: boolean
  content?: string
  deadlineText?: string
  statusText?: string
  acceptedApplicationId?: number
  acceptedUserId?: string
}

export type DemandApplicationListItem = {
  application_id: number
  demand_id: number
  user_id: number
  applied_at: number
  publisher_accepted: boolean
  applicant_confirmed: boolean
  publisher_confirmed: boolean
  cancel_requested_by?: 'publisher' | 'applicant' | null
  cancel_requested_at?: number | null
  cancelled: boolean
  cancelled_at?: number | null
  schedule_status:
    | 'pending_confirm'
    | 'accepted'
    | 'confirmed'
    | 'ongoing'
    | 'ended'
    | 'expired'
    | 'cancel_pending'
    | 'cancelled'
  schedule_status_text: string
  user: {
    id: number
    nickname: string
    avatar: string
  }
}

function mapDemandType(type: DemandRecord['demand_type']) {
  if (type === 'PHOTOGRAPHY') return '摄影'
  if (type === 'MAKEUP') return '妆娘'
  if (type === 'COSER') return 'Coser'
  if (type === 'RETOUCH') return '后期'
  return '其他'
}

function parseDemandType(label?: string): DemandRecord['demand_type'] {
  if (!label) return 'OTHER'
  const normalized = label.replace(/^(找|本)/, '')
  if (normalized === '摄影') return 'PHOTOGRAPHY'
  if (normalized === '妆娘' || normalized === '毛娘') return 'MAKEUP'
  if (normalized === 'Coser' || normalized.toLowerCase() === 'coser') return 'COSER'
  if (normalized === '后期') return 'RETOUCH'
  return 'OTHER'
}

function formatBudget(item: DemandRecord) {
  if (typeof item.budget_amount === 'number') return `${item.budget_amount}元`
  if (item.budget_type === 'free') return '无偿'
  if (item.budget_type === 'exchange') return '互勉'
  if (item.budget_type === 'negotiable') return '面议'
  if (item.budget_type === 'fixed') return '定价'
  return item.budget_type || undefined
}

function formatDateTime(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return ''
  const timestamp = typeof value === 'number' ? value : new Date(value).getTime()
  if (!timestamp || Number.isNaN(timestamp)) return ''
  return new Date(timestamp).toLocaleString('zh-CN', { hour12: false })
}

function parseBudgetSelection(value?: string) {
  if (!value) return {}
  if (value === '无偿') return { budget_type: 'free' }
  if (value === '互勉') return { budget_type: 'exchange' }
  if (value === '面议') return { budget_type: 'negotiable' }
  const numbers = value.match(/\d+/g)?.map(Number) || []
  return {
    budget_type: 'fixed',
    budget_amount: numbers.length > 0 ? numbers[numbers.length - 1] : undefined
  }
}

function parseParticipantLimit(value?: string) {
  if (!value) return undefined
  if (value === '1人') return 1
  if (value === '2-3人') return 3
  if (value === '4-6人') return 6
  if (value === '6人以上') return 6
  const numbers = value.match(/\d+/g)?.map(Number) || []
  return numbers.length > 0 ? numbers[numbers.length - 1] : undefined
}

function resolveAuthor(item: DemandRecord) {
  const authorId = String(item.user?.id || item.authorId || item.author_id || 0)
  const cachedUser = getCachedCurrentUser()
  if (cachedUser && cachedUser.id === authorId) {
    return {
      authorId,
      authorName: cachedUser.nickname,
      authorAvatar: cachedUser.avatarUrl
    }
  }

  return {
    authorId,
    authorName: item.user?.nickname || (Number(authorId) === 1 ? '粤次元君' : `用户${authorId || ''}`),
    authorAvatar: resolveAssetUrl(item.user?.avatar) || ''
  }
}

function mapDemand(item: DemandRecord): ExtendedDemand {
  const author = resolveAuthor(item)
  const eventTimeText = formatDateTime(item.event_time)
  const createdTimeText = formatDateTime(item.created_at)
  return {
    id: String(item.id),
    type: mapDemandType(item.demand_type),
    title: item.title,
    content: item.description || '',
    budget: formatBudget(item),
    location: item.location || item.city || '',
    time: eventTimeText || undefined,
    authorId: author.authorId,
    authorName: author.authorName,
    authorAvatar: author.authorAvatar,
    status: item.status === 'OPEN' ? 'open' : 'closed',
    createTime: createdTimeText || '刚刚',
    deadline: typeof item.deadline === 'number' ? item.deadline : item.deadline ? new Date(item.deadline).getTime() : undefined,
    participantLimit: item.participant_limit ?? undefined,
    applicationCount: item.application_count ?? undefined,
    scheduleStatus: item.schedule_status,
    scheduleStatusText: item.schedule_status_text || undefined,
    applicantConfirmed: !!item.applicant_confirmed,
    publisherConfirmed: !!item.publisher_confirmed,
    deadlineText: formatDateTime(item.deadline),
    statusText: item.status === 'OPEN' ? '招募中' : '已关闭'
    ,
    acceptedApplicationId: item.accepted_application_id ? Number(item.accepted_application_id) : undefined,
    acceptedUserId: item.accepted_user_id ? String(item.accepted_user_id) : undefined
  }
}

export function markDemandListShouldRefresh() {
  Taro.setStorageSync(DEMAND_LIST_REFRESH_KEY, '1')
}

export function consumeDemandListShouldRefresh() {
  const next = Taro.getStorageSync(DEMAND_LIST_REFRESH_KEY)
  if (!next) return false
  Taro.removeStorageSync(DEMAND_LIST_REFRESH_KEY)
  return true
}

export function markMyAppliedDemandsShouldRefresh() {
  Taro.setStorageSync(MY_APPLIED_DEMANDS_REFRESH_KEY, '1')
}

export function consumeMyAppliedDemandsShouldRefresh() {
  const next = Taro.getStorageSync(MY_APPLIED_DEMANDS_REFRESH_KEY)
  if (!next) return false
  Taro.removeStorageSync(MY_APPLIED_DEMANDS_REFRESH_KEY)
  return true
}

export async function listDemands(type?: string): Promise<Demand[]> {
  if (!isMockMode()) {
    const suffix = type ? `?demand_type=${encodeURIComponent(parseDemandType(type))}` : ''
    const data = await get<DemandListResponse>(`/demands${suffix}`)
    return (data.list || []).map(mapDemand)
  }
  return mockResponse(type ? mockDemands.filter((d) => d.type === mapDemandType(parseDemandType(type))) : mockDemands)
}

export async function listMyDemands(): Promise<Demand[]> {
  if (!isMockMode()) {
    const data = await get<DemandListResponse>('/demands/me', { requireAuth: true })
    return (data.list || []).map(mapDemand)
  }
  return mockResponse(mockDemands.filter((d) => d.authorId === currentUser.id))
}

export async function getDemandById(id: string): Promise<ExtendedDemand | undefined> {
  if (!isMockMode()) {
    const data = await get<DemandRecord | null>(`/demands/${id}`)
    return data ? mapDemand(data) : undefined
  }
  return mockResponse(mockDemands.find((d) => d.id === id) as any)
}

export async function createDemand(payload: {
  type: string
  title: string
  desc: string
  time?: string
  deadline?: string
  location?: string
  budget?: string
  count?: string
}) {
  if (!isMockMode()) {
    const budget = parseBudgetSelection(payload.budget)
    const data = await post<DemandRecord>(
      '/demands',
      {
        demand_type: parseDemandType(payload.type),
        title: payload.title,
        description: payload.desc,
        location: payload.location,
        city: payload.location,
        event_time: payload.time ? new Date(payload.time).getTime() : undefined,
        deadline: payload.deadline ? new Date(payload.deadline).getTime() : undefined,
        budget_type: budget.budget_type,
        budget_amount: budget.budget_amount,
        participant_limit: parseParticipantLimit(payload.count)
      },
      { requireAuth: true }
    )
    markDemandListShouldRefresh()
    return mapDemand(data)
  }
  return mockResponse({ ...mockDemands[0], id: `d_${Date.now()}`, title: payload.title, type: payload.type })
}

export async function getDemandApplicationStatus(id: string) {
  if (!isMockMode()) {
    return get<{
      applied: boolean
      role?: 'applicant' | 'publisher'
      has_applicants?: boolean
      accepted_application_id?: number | null
      accepted_user_id?: number | null
      can_apply?: boolean
      can_accept?: boolean
      applicant_confirmed?: boolean
      publisher_confirmed?: boolean
      can_confirm?: boolean
      confirm_action?: 'accept' | 'final_confirm' | null
      can_request_cancel?: boolean
      can_confirm_cancel?: boolean
      cancel_requested_by?: 'applicant' | 'publisher' | null
      apply_disabled_reason?: 'already accepted'
      application_id?: number
      schedule_status?:
        | 'pending_confirm'
        | 'accepted'
        | 'confirmed'
        | 'ongoing'
        | 'ended'
        | 'expired'
        | 'cancel_pending'
        | 'cancelled'
      schedule_status_text?: string
    }>(`/demands/${id}/apply/status`, { requireAuth: true })
  }
  return mockResponse({ applied: false, can_confirm: false, can_apply: true })
}

export async function applyDemand(id: string) {
  if (!isMockMode()) {
    return post<{ applied: boolean }>(`/demands/${id}/apply`, {}, { requireAuth: true })
  }
  return mockResponse({ applied: true })
}

export async function confirmDemandSchedule(
  id: string,
  applicationId?: number
): Promise<{
  confirmed: boolean
  role: 'applicant' | 'publisher'
  application_id?: number
  schedule_status:
    | 'pending_confirm'
    | 'accepted'
    | 'confirmed'
    | 'ongoing'
    | 'ended'
    | 'expired'
    | 'cancel_pending'
    | 'cancelled'
  schedule_status_text: string
}> {
  if (!isMockMode()) {
    return post<{
      confirmed: boolean
      role: 'applicant' | 'publisher'
      application_id?: number
      schedule_status:
        | 'pending_confirm'
        | 'accepted'
        | 'confirmed'
        | 'ongoing'
        | 'ended'
        | 'expired'
        | 'cancel_pending'
        | 'cancelled'
      schedule_status_text: string
    }>(
      `/demands/${id}/apply/confirm`,
      applicationId ? { application_id: applicationId } : {},
      { requireAuth: true }
    )
  }
  return mockResponse({ confirmed: true, role: 'applicant', schedule_status: 'confirmed', schedule_status_text: '已确认' })
}

export async function requestDemandAgreementCancel(id: string) {
  if (!isMockMode()) {
    return post<{
      requested: boolean
      schedule_status: 'cancel_pending'
      schedule_status_text: string
    }>(`/demands/${id}/agreement/cancel/request`, {}, { requireAuth: true })
  }
  return mockResponse({ requested: true, schedule_status: 'cancel_pending', schedule_status_text: '取消待确认' })
}

export async function confirmDemandAgreementCancel(id: string) {
  if (!isMockMode()) {
    return post<{
      confirmed: boolean
      cancelled: boolean
      schedule_status: 'cancel_pending' | 'cancelled'
      schedule_status_text: string
    }>(`/demands/${id}/agreement/cancel/confirm`, {}, { requireAuth: true })
  }
  return mockResponse({ confirmed: true, cancelled: true, schedule_status: 'cancelled', schedule_status_text: '已取消约定' })
}

export async function listMyAppliedDemands() {
  if (!isMockMode()) {
    const data = await get<{ list: DemandRecord[] }>('/demands/me/applied', { requireAuth: true })
    return (data.list || []).map(mapDemand)
  }
  return mockResponse(mockDemands.slice(0, 1))
}

export async function listDemandApplicationsByDemand(demandId: string) {
  if (!isMockMode()) {
    return get<{ list: DemandApplicationListItem[] }>(`/demands/${demandId}/applications`, { requireAuth: true })
  }
  return mockResponse({ list: [] as DemandApplicationListItem[] })
}
