import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MoreThan, Repository } from 'typeorm'
import { Venue } from '../../database/entities/venue.entity'
import { VenueScene } from '../../database/entities/venue-scene.entity'
import { VenueBooking } from '../../database/entities/venue-booking.entity'

type UpsertVenuePayload = {
  name?: string
  city?: string
  address?: string
  cover_image?: string
  description?: string
  status?: number
  sort_order?: number
}

type UpsertScenePayload = {
  venue_id?: number
  name?: string
  image_url?: string
  description?: string
  capacity?: number | null
  status?: number
  sort_order?: number
}

type BookingPayload = {
  scene_id?: number
  start_time?: number
  end_time?: number
  note?: string
}

function toVenueResponse(item: Venue, scenes: VenueScene[] = []) {
  return {
    id: item.id,
    name: item.name || '',
    city: item.city || '',
    address: item.address || '',
    cover_image: item.coverImage || '',
    description: item.description || '',
    status: item.status,
    sort_order: item.sortOrder || 0,
    created_at: item.createdAt?.getTime?.() || null,
    scenes: scenes.map(toSceneResponse)
  }
}

function toSceneResponse(item: VenueScene) {
  return {
    id: item.id,
    venue_id: item.venueId,
    name: item.name || '',
    image_url: item.imageUrl || '',
    description: item.description || '',
    capacity: item.capacity ?? null,
    status: item.status,
    sort_order: item.sortOrder || 0,
    created_at: item.createdAt?.getTime?.() || null
  }
}

function toBookingResponse(item: VenueBooking) {
  return {
    id: item.id,
    venue_id: item.venueId,
    scene_id: item.sceneId,
    user_id: item.userId,
    start_time: item.startTime?.getTime?.() || null,
    end_time: item.endTime?.getTime?.() || null,
    note: item.note || '',
    status: item.status,
    created_at: item.createdAt?.getTime?.() || null
  }
}

function normalizeInt(value: unknown, fallback = 0) {
  const next = Number(value)
  return Number.isFinite(next) ? Math.trunc(next) : fallback
}

function normalizeTimestamp(value: unknown) {
  const next = Number(value)
  if (!Number.isFinite(next) || next <= 0) throw new BadRequestException('invalid time')
  return Math.trunc(next)
}

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private readonly venuesRepo: Repository<Venue>,
    @InjectRepository(VenueScene)
    private readonly scenesRepo: Repository<VenueScene>,
    @InjectRepository(VenueBooking)
    private readonly bookingsRepo: Repository<VenueBooking>
  ) {}

  async list() {
    const venues = await this.venuesRepo.find({
      where: { status: 1 },
      order: { sortOrder: 'ASC', id: 'DESC' }
    })
    const venueIds = venues.map((item) => item.id)
    const scenes = venueIds.length
      ? await this.scenesRepo
        .createQueryBuilder('scene')
        .where('scene.venue_id IN (:...venueIds)', { venueIds })
        .andWhere('scene.status = :status', { status: 1 })
        .orderBy('scene.sort_order', 'ASC')
        .addOrderBy('scene.id', 'DESC')
        .getMany()
      : []
    return {
      list: venues.map((venue) => toVenueResponse(venue, scenes.filter((scene) => scene.venueId === venue.id))),
      total: venues.length
    }
  }

  async getById(id: number) {
    const venue = await this.venuesRepo.findOne({ where: { id, status: 1 } })
    if (!venue) return null
    const scenes = await this.scenesRepo.find({
      where: { venueId: id, status: 1 },
      order: { sortOrder: 'ASC', id: 'DESC' }
    })
    return toVenueResponse(venue, scenes)
  }

  async listForAdmin() {
    const [venues, scenes, bookings] = await Promise.all([
      this.venuesRepo.find({ order: { sortOrder: 'ASC', id: 'DESC' } }),
      this.scenesRepo.find({ order: { sortOrder: 'ASC', id: 'DESC' } }),
      this.bookingsRepo.find({
        where: { endTime: MoreThan(new Date()) },
        order: { startTime: 'ASC', id: 'DESC' },
        take: 100
      })
    ])
    return {
      venues: venues.map((venue) => toVenueResponse(venue, scenes.filter((scene) => scene.venueId === venue.id))),
      scenes: scenes.map(toSceneResponse),
      bookings: bookings.map(toBookingResponse)
    }
  }

  async createVenue(payload: UpsertVenuePayload) {
    const name = String(payload.name || '').trim()
    if (!name) throw new BadRequestException('name required')
    const item = this.venuesRepo.create({
      name,
      city: String(payload.city || '').trim() || undefined,
      address: String(payload.address || '').trim() || undefined,
      coverImage: String(payload.cover_image || '').trim() || undefined,
      description: String(payload.description || '').trim() || undefined,
      status: normalizeInt(payload.status, 1),
      sortOrder: normalizeInt(payload.sort_order, 0)
    })
    return toVenueResponse(await this.venuesRepo.save(item))
  }

  async updateVenue(id: number, payload: UpsertVenuePayload) {
    const item = await this.venuesRepo.findOne({ where: { id } })
    if (!item) throw new NotFoundException('venue not found')
    if (payload.name !== undefined) {
      const name = String(payload.name || '').trim()
      if (!name) throw new BadRequestException('name required')
      item.name = name
    }
    if (payload.city !== undefined) item.city = String(payload.city || '').trim()
    if (payload.address !== undefined) item.address = String(payload.address || '').trim()
    if (payload.cover_image !== undefined) item.coverImage = String(payload.cover_image || '').trim()
    if (payload.description !== undefined) item.description = String(payload.description || '').trim()
    if (payload.status !== undefined) item.status = normalizeInt(payload.status, 1)
    if (payload.sort_order !== undefined) item.sortOrder = normalizeInt(payload.sort_order, 0)
    return toVenueResponse(await this.venuesRepo.save(item))
  }

  async createScene(payload: UpsertScenePayload) {
    const venueId = normalizeInt(payload.venue_id, 0)
    const venue = venueId ? await this.venuesRepo.findOne({ where: { id: venueId } }) : null
    if (!venue) throw new BadRequestException('venue required')
    const name = String(payload.name || '').trim()
    if (!name) throw new BadRequestException('name required')
    const item = this.scenesRepo.create({
      venueId,
      name,
      imageUrl: String(payload.image_url || '').trim() || undefined,
      description: String(payload.description || '').trim() || undefined,
      capacity: payload.capacity === null || payload.capacity === undefined ? null : normalizeInt(payload.capacity, 0),
      status: normalizeInt(payload.status, 1),
      sortOrder: normalizeInt(payload.sort_order, 0)
    })
    return toSceneResponse(await this.scenesRepo.save(item))
  }

  async updateScene(id: number, payload: UpsertScenePayload) {
    const item = await this.scenesRepo.findOne({ where: { id } })
    if (!item) throw new NotFoundException('scene not found')
    if (payload.venue_id !== undefined) {
      const venueId = normalizeInt(payload.venue_id, 0)
      const venue = venueId ? await this.venuesRepo.findOne({ where: { id: venueId } }) : null
      if (!venue) throw new BadRequestException('venue required')
      item.venueId = venueId
    }
    if (payload.name !== undefined) {
      const name = String(payload.name || '').trim()
      if (!name) throw new BadRequestException('name required')
      item.name = name
    }
    if (payload.image_url !== undefined) item.imageUrl = String(payload.image_url || '').trim()
    if (payload.description !== undefined) item.description = String(payload.description || '').trim()
    if (payload.capacity !== undefined) item.capacity = payload.capacity === null ? null : normalizeInt(payload.capacity, 0)
    if (payload.status !== undefined) item.status = normalizeInt(payload.status, 1)
    if (payload.sort_order !== undefined) item.sortOrder = normalizeInt(payload.sort_order, 0)
    return toSceneResponse(await this.scenesRepo.save(item))
  }

  async createBooking(userId: number, payload: BookingPayload) {
    const sceneId = normalizeInt(payload.scene_id, 0)
    const scene = sceneId ? await this.scenesRepo.findOne({ where: { id: sceneId, status: 1 } }) : null
    if (!scene) throw new BadRequestException('scene required')
    const venue = await this.venuesRepo.findOne({ where: { id: scene.venueId, status: 1 } })
    if (!venue) throw new BadRequestException('venue unavailable')

    const startMs = normalizeTimestamp(payload.start_time)
    const endMs = normalizeTimestamp(payload.end_time)
    const now = Date.now()
    const latest = now + 24 * 60 * 60 * 1000
    if (startMs < now - 60_000 || startMs > latest || endMs > latest) throw new BadRequestException('time out of range')
    if (endMs <= startMs) throw new BadRequestException('invalid time range')
    if (endMs - startMs > 24 * 60 * 60 * 1000) throw new BadRequestException('invalid time range')

    const conflict = await this.bookingsRepo
      .createQueryBuilder('booking')
      .where('booking.scene_id = :sceneId', { sceneId })
      .andWhere('booking.status = :status', { status: 'CONFIRMED' })
      .andWhere('booking.start_time < :endTime', { endTime: new Date(endMs) })
      .andWhere('booking.end_time > :startTime', { startTime: new Date(startMs) })
      .getOne()
    if (conflict) throw new BadRequestException('time already booked')

    const item = this.bookingsRepo.create({
      venueId: scene.venueId,
      sceneId,
      userId,
      startTime: new Date(startMs),
      endTime: new Date(endMs),
      note: String(payload.note || '').trim() || undefined,
      status: 'CONFIRMED'
    })
    return toBookingResponse(await this.bookingsRepo.save(item))
  }
}
