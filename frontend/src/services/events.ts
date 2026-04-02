import Taro from '@tarojs/taro'
import { get, isMockMode, mockResponse, post, resolveAssetUrl } from './request'
import { mockEvents, type Event } from '../mocks/events'
import { mockProfileTabs } from '../mocks/profile'

const MY_EVENTS_REFRESH_KEY = 'my_events_should_refresh'

type EventRecord = {
  id: number
  title: string
  cover_image?: string | null
  start_time?: number | string | null
  end_time?: number | string | null
  location?: string | null
  description?: string | null
  price?: number | null
  organizer?: string | null
  status: 'UPCOMING' | 'ONGOING' | 'ENDED'
  event_type?: 'info' | 'official'
  capacity?: number | null
  registration_deadline?: number | string | null
  registered_at?: number | string | null
}

type EventListResponse = {
  list: EventRecord[]
  total: number
}

export type ExtendedEvent = Event & {
  description?: string
  capacity?: number
  registrationDeadline?: number
  registrationDeadlineText?: string
  eventType?: string
  startTime?: number
  endTime?: number
  statusText?: string
  registeredAt?: number
  registeredAtText?: string
}

function formatDateTime(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return '待定'
  const timestamp = typeof value === 'number' ? value : new Date(value).getTime()
  if (!timestamp || Number.isNaN(timestamp)) return '待定'
  return new Date(timestamp).toLocaleString('zh-CN', { hour12: false })
}

function formatOptionalDateTime(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return ''
  return formatDateTime(value)
}

function formatEventTime(startTime?: number | string | null, endTime?: number | string | null) {
  if (!startTime) return '待定'
  const start = formatDateTime(startTime)
  if (!endTime) return start
  const end = formatDateTime(endTime)
  return `${start} - ${end}`
}

function mapEventStatus(status: EventRecord['status']): Event['status'] {
  if (status === 'ONGOING') return 'ongoing'
  if (status === 'ENDED') return 'ended'
  return 'upcoming'
}

function mapEvent(item: EventRecord): ExtendedEvent {
  const status = mapEventStatus(item.status)
  return {
    id: String(item.id),
    title: item.title,
    coverUrl: resolveAssetUrl(item.cover_image || undefined) || 'https://images.unsplash.com/photo-1612487528505-d2338264c821?auto=format&fit=crop&q=80&w=800',
    time: formatEventTime(item.start_time, item.end_time),
    location: item.location || '待定',
    status,
    price: typeof item.price === 'number' ? `¥ ${item.price}` : '免费',
    organizer: item.organizer || '官方',
    description: item.description || undefined,
    capacity: item.capacity ?? undefined,
    registrationDeadline: typeof item.registration_deadline === 'number' ? item.registration_deadline : item.registration_deadline ? new Date(item.registration_deadline).getTime() : undefined,
    eventType: item.event_type,
    startTime: typeof item.start_time === 'number' ? item.start_time : item.start_time ? new Date(item.start_time).getTime() : undefined,
    endTime: typeof item.end_time === 'number' ? item.end_time : item.end_time ? new Date(item.end_time).getTime() : undefined,
    registrationDeadlineText: formatDateTime(item.registration_deadline),
    statusText: status === 'ongoing' ? '进行中' : status === 'ended' ? '已结束' : '即将开始',
    registeredAt: typeof item.registered_at === 'number' ? item.registered_at : item.registered_at ? new Date(item.registered_at).getTime() : undefined,
    registeredAtText: formatOptionalDateTime(item.registered_at)
  }
}

export function markMyEventsShouldRefresh() {
  Taro.setStorageSync(MY_EVENTS_REFRESH_KEY, '1')
}

export function consumeMyEventsShouldRefresh() {
  const next = Taro.getStorageSync(MY_EVENTS_REFRESH_KEY)
  if (!next) return false
  Taro.removeStorageSync(MY_EVENTS_REFRESH_KEY)
  return true
}

export function getEventRegistrationErrorMessage(error: any) {
  const message = String(error?.message || '')
  if (message === 'already registered') return '你已经报名过该活动了'
  if (message === 'deadline passed') return '报名已截止'
  if (message === 'full') return '活动名额已满'
  if (message === 'not allow') return '该活动为资讯内容，暂不支持报名'
  if (message === 'event not found') return '活动不存在或已下线'
  return message || '报名失败'
}

export async function listEvents(type?: 'info' | 'official'): Promise<ExtendedEvent[]> {
  if (!isMockMode()) {
    const suffix = type ? `?type=${type}` : ''
    const data = await get<EventListResponse>(`/events${suffix}`)
    return (data.list || []).map(mapEvent)
  }
  return mockResponse(type ? mockEvents.filter((e) => (type === 'official' ? e.organizer.includes('官方') : !e.organizer.includes('官方'))) : mockEvents)
}

export async function listOfficialEvents(): Promise<ExtendedEvent[]> {
  return listEvents('official')
}

export async function getEventById(id: string): Promise<ExtendedEvent | undefined> {
  if (!isMockMode()) {
    const data = await get<EventRecord | null>(`/events/${id}`)
    return data ? mapEvent(data) : undefined
  }
  return mockResponse(mockEvents.find((e) => e.id === id) as any)
}

export async function listMyEvents(): Promise<ExtendedEvent[]> {
  if (!isMockMode()) {
    const data = await get<{ list: EventRecord[] }>('/events/me/registrations', { requireAuth: true })
    return (data.list || []).map(mapEvent)
  }
  return mockResponse(mockProfileTabs.events)
}

export async function getEventRegistrationStatus(id: string) {
  if (!isMockMode()) {
    return get<{ registered: boolean }>(`/events/${id}/register/status`, { requireAuth: true })
  }
  const joined = mockProfileTabs.events.some((e) => e.id === id)
  return mockResponse({ registered: joined })
}

export async function registerEvent(id: string) {
  if (!isMockMode()) {
    return post<{ registered: boolean }>(`/events/${id}/register`, {}, { requireAuth: true })
  }
  return mockResponse({ registered: true })
}
