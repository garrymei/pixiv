import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Event } from '../../database/entities/event.entity'

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

function toEventResponse(item: Event): EventResponse {
  return {
    id: item.id,
    title: item.title || '',
    cover_image: item.coverImage || item.coverUrl || '',
    start_time: item.startTime ? new Date(item.startTime).getTime() : null,
    end_time: item.endTime ? new Date(item.endTime).getTime() : null,
    location: item.location || '',
    description: item.description || '',
    price: item.price !== undefined && item.price !== null ? Number(item.price) : null,
    organizer: item.organizer || '',
    status: item.status as EventResponse['status'],
    event_type: item.eventType as EventResponse['event_type'],
    is_registerable: item.eventType === 'official',
    capacity: item.capacity ?? null,
    registration_deadline: item.registrationDeadline ? new Date(item.registrationDeadline).getTime() : null
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
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepo: Repository<Event>
  ) {}

  async list(params: { type?: 'info' | 'official'; page?: number; pageSize?: number }) {
    const { type, page = 1, pageSize = 10 } = params || {}
    const [items, total] = await this.eventsRepo.findAndCount({
      where: type ? { eventType: type } : {},
      order: { startTime: 'ASC', id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
    return { list: items.map(toEventResponse), total, page, pageSize }
  }

  async getById(id: number) {
    const item = await this.eventsRepo.findOne({ where: { id } })
    return item ? toEventResponse(item) : null
  }

  async create(payload: UpsertEventPayload) {
    const title = String(payload.title || '').trim()
    if (!title) throw new BadRequestException('title required')
    const item = this.eventsRepo.create({
      title,
      coverImage: String(payload.cover_image || '').trim() || undefined,
      coverUrl: String(payload.cover_image || '').trim() || undefined,
      startTime: normalizeTimestamp(payload.start_time) ? new Date(normalizeTimestamp(payload.start_time) as number) : undefined,
      endTime: normalizeTimestamp(payload.end_time) ? new Date(normalizeTimestamp(payload.end_time) as number) : undefined,
      location: String(payload.location || '').trim() || undefined,
      description: String(payload.description || '').trim() || undefined,
      price: normalizePrice(payload.price),
      organizer: String(payload.organizer || '').trim() || undefined,
      status: (payload.status || 'UPCOMING') as Event['status'],
      eventType: payload.event_type || 'official',
      capacity: normalizeCapacity(payload.capacity),
      registrationDeadline: normalizeTimestamp(payload.registration_deadline)
        ? new Date(normalizeTimestamp(payload.registration_deadline) as number)
        : undefined
    })
    const saved = await this.eventsRepo.save(item)
    return toEventResponse(saved)
  }

  async update(id: number, payload: Partial<UpsertEventPayload>) {
    const item = await this.eventsRepo.findOne({ where: { id } })
    if (!item) throw new NotFoundException('event not found')

    if (payload.title !== undefined) {
      const title = String(payload.title || '').trim()
      if (!title) throw new BadRequestException('title required')
      item.title = title
    }
    if (payload.cover_image !== undefined) {
      item.coverImage = String(payload.cover_image || '').trim()
      item.coverUrl = String(payload.cover_image || '').trim()
    }
    if (payload.start_time !== undefined) item.startTime = normalizeTimestamp(payload.start_time) ? new Date(normalizeTimestamp(payload.start_time) as number) : undefined
    if (payload.end_time !== undefined) item.endTime = normalizeTimestamp(payload.end_time) ? new Date(normalizeTimestamp(payload.end_time) as number) : undefined
    if (payload.location !== undefined) item.location = String(payload.location || '').trim()
    if (payload.description !== undefined) item.description = String(payload.description || '').trim()
    if (payload.price !== undefined) item.price = normalizePrice(payload.price)
    if (payload.organizer !== undefined) item.organizer = String(payload.organizer || '').trim()
    if (payload.status !== undefined) item.status = payload.status as Event['status']
    if (payload.event_type !== undefined) item.eventType = payload.event_type
    if (payload.capacity !== undefined) item.capacity = normalizeCapacity(payload.capacity)
    if (payload.registration_deadline !== undefined) {
      item.registrationDeadline = normalizeTimestamp(payload.registration_deadline)
        ? new Date(normalizeTimestamp(payload.registration_deadline) as number)
        : undefined
    }

    return toEventResponse(await this.eventsRepo.save(item))
  }

  async remove(id: number) {
    const item = await this.eventsRepo.findOne({ where: { id } })
    if (!item) throw new NotFoundException('event not found')
    await this.eventsRepo.remove(item)
    return toEventResponse(item)
  }
}
