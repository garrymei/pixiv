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
    title: '官方·广州同好会',
    cover_image: '',
    start_time: Date.now() + 86400000,
    end_time: Date.now() + 2 * 86400000,
    location: '广州海心沙',
    description: '同好交流',
    price: 0,
    organizer: '官方',
    status: 'UPCOMING',
    event_type: 'official',
    capacity: 50,
    registration_deadline: Date.now() + 80000000
  },
  {
    id: 2,
    title: '资讯·漫展消息',
    cover_image: '',
    start_time: Date.now() + 10 * 86400000,
    location: '深圳会展',
    description: '展会资讯',
    status: 'UPCOMING',
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
