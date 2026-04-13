import { Injectable } from '@nestjs/common'
import { BadRequestException, NotFoundException } from '@nestjs/common'

type EventItem = {
  id: number
  title: string
  cover_image?: string
  start_time?: number
  end_time?: number
  location?: string
  description?: string
  price?: number
  organizer?: string
  status: 'UPCOMING' | 'ONGOING' | 'ENDED'
  event_type: 'info' | 'official'
  is_registerable: boolean
  capacity?: number
  registration_deadline?: number
}

type UpsertEventPayload = {
  title: string
  cover_image?: string
  start_time?: number
  end_time?: number
  location?: string
  description?: string
  price?: number | null
  organizer?: string
  status?: 'UPCOMING' | 'ONGOING' | 'ENDED'
  event_type?: 'info' | 'official'
  is_registerable?: boolean
  capacity?: number | null
  registration_deadline?: number | null
}

type EventResponse = {
  id: number
  title: string
  cover_image: string
  start_time: number | null
  end_time: number | null
  location: string
  description: string
  price: number | null
  organizer: string
  status: 'UPCOMING' | 'ONGOING' | 'ENDED'
  event_type: 'info' | 'official'
  is_registerable: boolean
  capacity: number | null
  registration_deadline: number | null
}

let seq = 300
const events: EventItem[] = [
  {
    id: 1,
    title: '第28届 YACA 动漫展 - 盛夏狂欢季',
    cover_image: 'https://images.unsplash.com/photo-1612487528505-d2338264c821?auto=format&fit=crop&q=80&w=800',
    start_time: new Date('2026-08-15T09:00:00+08:00').getTime(),
    end_time: new Date('2026-08-17T18:00:00+08:00').getTime(),
    location: '广州保利世贸博览馆',
    description: '年度大型动漫展，含舞台、签售、宅舞与同人摊位。',
    price: 68,
    organizer: 'YACA 组委会',
    status: 'UPCOMING',
    event_type: 'info',
    is_registerable: false
  },
  {
    id: 2,
    title: '【官方举办】周末二次元同好面基会（包含摄影交流、Coser游园）',
    cover_image: 'https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&q=80&w=800',
    start_time: new Date('2026-04-20T14:00:00+08:00').getTime(),
    end_time: new Date('2026-04-20T18:00:00+08:00').getTime(),
    location: '广州市天河区动漫星城',
    description: '适合扩列、面基与线下交流的官方活动。',
    price: 0,
    organizer: '粤次元君_官方',
    status: 'UPCOMING',
    event_type: 'official',
    is_registerable: true,
    capacity: 50,
    registration_deadline: new Date('2026-04-19T23:59:59+08:00').getTime()
  },
  {
    id: 3,
    title: '初音未来 15周年 纪念全息演唱会 - 广州站',
    cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
    start_time: new Date('2025-12-24T19:30:00+08:00').getTime(),
    end_time: new Date('2025-12-24T22:00:00+08:00').getTime(),
    location: '广州体育馆',
    description: '周年纪念演出活动。',
    price: 280,
    organizer: '某演出公司',
    status: 'ENDED',
    event_type: 'info',
    is_registerable: false
  }
]

function toEventResponse(item: EventItem): EventResponse {
  return {
    id: item.id,
    title: item.title || '',
    cover_image: item.cover_image || '',
    start_time: item.start_time ?? null,
    end_time: item.end_time ?? null,
    location: item.location || '',
    description: item.description || '',
    price: item.price ?? null,
    organizer: item.organizer || '',
    status: item.status,
    event_type: item.event_type,
    is_registerable: item.is_registerable,
    capacity: item.capacity ?? null,
    registration_deadline: item.registration_deadline ?? null
  }
}

function normalizeTimestamp(value?: number | null) {
  if (value === null || value === undefined) return undefined
  if (!Number.isFinite(value)) throw new BadRequestException('invalid timestamp')
  return Math.trunc(value)
}

function normalizePrice(value?: number | null) {
  if (value === null || value === undefined) return undefined
  if (!Number.isFinite(value) || value < 0) throw new BadRequestException('invalid price')
  return Math.trunc(value)
}

function normalizeCapacity(value?: number | null) {
  if (value === null || value === undefined) return undefined
  if (!Number.isFinite(value) || value < 0) throw new BadRequestException('invalid capacity')
  return Math.trunc(value)
}

@Injectable()
export class EventsService {
  async list(params: { type?: 'info' | 'official'; page?: number; pageSize?: number }) {
    const { type, page = 1, pageSize = 10 } = params || {}
    const filtered = type ? events.filter(e => e.event_type === type) : events
    const start = (page - 1) * pageSize
    const data = filtered.slice(start, start + pageSize).map(toEventResponse)
    return { list: data, total: filtered.length, page, pageSize }
  }

  async getById(id: number) {
    const item = events.find(e => e.id === id)
    return item ? toEventResponse(item) : null
  }

  async create(payload: UpsertEventPayload) {
    const title = String(payload.title || '').trim()
    if (!title) throw new BadRequestException('title required')

    const item: EventItem = {
      id: ++seq,
      title,
      cover_image: String(payload.cover_image || '').trim() || undefined,
      start_time: normalizeTimestamp(payload.start_time),
      end_time: normalizeTimestamp(payload.end_time),
      location: String(payload.location || '').trim() || undefined,
      description: String(payload.description || '').trim() || undefined,
      price: normalizePrice(payload.price),
      organizer: String(payload.organizer || '').trim() || undefined,
      status: payload.status || 'UPCOMING',
      event_type: payload.event_type || 'official',
      is_registerable: payload.is_registerable ?? (payload.event_type ? payload.event_type === 'official' : true),
      capacity: normalizeCapacity(payload.capacity),
      registration_deadline: normalizeTimestamp(payload.registration_deadline)
    }
    events.unshift(item)
    return toEventResponse(item)
  }

  async update(id: number, payload: Partial<UpsertEventPayload>) {
    const item = events.find(e => e.id === id)
    if (!item) throw new NotFoundException('event not found')

    if (payload.title !== undefined) {
      const title = String(payload.title || '').trim()
      if (!title) throw new BadRequestException('title required')
      item.title = title
    }
    if (payload.cover_image !== undefined) item.cover_image = String(payload.cover_image || '').trim()
    if (payload.start_time !== undefined) item.start_time = normalizeTimestamp(payload.start_time)
    if (payload.end_time !== undefined) item.end_time = normalizeTimestamp(payload.end_time)
    if (payload.location !== undefined) item.location = String(payload.location || '').trim()
    if (payload.description !== undefined) item.description = String(payload.description || '').trim()
    if (payload.price !== undefined) item.price = normalizePrice(payload.price)
    if (payload.organizer !== undefined) item.organizer = String(payload.organizer || '').trim()
    if (payload.status !== undefined) item.status = payload.status
    if (payload.event_type !== undefined) item.event_type = payload.event_type
    if (payload.is_registerable !== undefined) item.is_registerable = !!payload.is_registerable
    if (payload.capacity !== undefined) item.capacity = normalizeCapacity(payload.capacity)
    if (payload.registration_deadline !== undefined) item.registration_deadline = normalizeTimestamp(payload.registration_deadline)

    return toEventResponse(item)
  }

  async remove(id: number) {
    const index = events.findIndex(e => e.id === id)
    if (index === -1) throw new NotFoundException('event not found')
    const [removed] = events.splice(index, 1)
    return toEventResponse(removed)
  }
}
