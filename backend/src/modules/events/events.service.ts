import { Injectable } from '@nestjs/common'

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
  capacity?: number
  registration_deadline?: number
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
    event_type: 'info'
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
    event_type: 'info'
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
    capacity: item.capacity ?? null,
    registration_deadline: item.registration_deadline ?? null
  }
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
}
