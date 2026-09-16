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

type AdminBookingPayload = BookingPayload & {
  booking_type?: 'ADMIN' | 'BLOCKED'
  customer_name?: string
  customer_phone?: string
}

const HALF_HOUR_MS = 30 * 60 * 1000
const BUSINESS_TIMEZONE_OFFSET_MS = 8 * 60 * 60 * 1000
const OPENING_MINUTES = 11 * 60
const CLOSING_MINUTES = 23 * 60

function getBusinessTimeParts(timestamp: number) {
  const date = new Date(timestamp + BUSINESS_TIMEZONE_OFFSET_MS)
  return {
    dateKey: `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`,
    minutes: date.getUTCHours() * 60 + date.getUTCMinutes()
  }
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
    user_id: item.userId ?? null,
    user_nickname: item.user?.nickname || '',
    user_avatar_url: item.user?.avatarUrl || '',
    booking_type: item.bookingType || 'USER',
    customer_name: item.customerName || '',
    customer_phone: item.customerPhone || '',
    created_by_admin: item.createdByAdmin || 0,
    start_time: item.startTime?.getTime?.() || null,
    end_time: item.endTime?.getTime?.() || null,
    note: item.note || '',
    status: item.status,
    created_at: item.createdAt?.getTime?.() || null
  }
}

function getAvailabilityWindow() {
  const now = Date.now()
  const businessDate = new Date(now + BUSINESS_TIMEZONE_OFFSET_MS)
  const latest = Date.UTC(
    businessDate.getUTCFullYear(),
    businessDate.getUTCMonth(),
    businessDate.getUTCDate() + 30,
    CLOSING_MINUTES / 60
  ) - BUSINESS_TIMEZONE_OFFSET_MS
  return {
    now,
    latest
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

  async getSceneAvailability(sceneId: number) {
    const scene = await this.scenesRepo.findOne({ where: { id: sceneId, status: 1 } })
    if (!scene) throw new NotFoundException('scene not found')

    const venue = await this.venuesRepo.findOne({ where: { id: scene.venueId, status: 1 } })
    if (!venue) throw new NotFoundException('venue not found')

    const { now, latest } = getAvailabilityWindow()
    const bookings = await this.bookingsRepo
      .createQueryBuilder('booking')
      .where('booking.scene_id = :sceneId', { sceneId })
      .andWhere('booking.status = :status', { status: 'CONFIRMED' })
      .andWhere('booking.end_time > :now', { now: new Date(now) })
      .andWhere('booking.start_time < :latest', { latest: new Date(latest) })
      .orderBy('booking.start_time', 'ASC')
      .addOrderBy('booking.id', 'DESC')
      .getMany()

    return {
      venue: toVenueResponse(venue, [scene]),
      scene: toSceneResponse(scene),
      bookings: bookings.map(toBookingResponse),
      window_start: now,
      window_end: latest
    }
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

  async listByUser(userId: number) {
    const bookings = await this.bookingsRepo.find({
      where: { userId, status: 'CONFIRMED' },
      order: { startTime: 'ASC', id: 'DESC' }
    })
    if (!bookings.length) return { list: [] }

    const venueIds = Array.from(new Set(bookings.map((item) => item.venueId)))
    const sceneIds = Array.from(new Set(bookings.map((item) => item.sceneId)))
    const [venues, scenes] = await Promise.all([
      venueIds.length ? this.venuesRepo.find({ where: venueIds.map((id) => ({ id })) }) : [],
      sceneIds.length ? this.scenesRepo.find({ where: sceneIds.map((id) => ({ id })) }) : []
    ])
    const venueMap = new Map(venues.map((item) => [item.id, item]))
    const sceneMap = new Map(scenes.map((item) => [item.id, item]))

    return {
      list: bookings.map((item) => ({
        ...toBookingResponse(item),
        venue_name: venueMap.get(item.venueId)?.name || '',
        venue_city: venueMap.get(item.venueId)?.city || '',
        venue_address: venueMap.get(item.venueId)?.address || '',
        venue_cover_image: venueMap.get(item.venueId)?.coverImage || '',
        scene_name: sceneMap.get(item.sceneId)?.name || '',
        scene_image_url: sceneMap.get(item.sceneId)?.imageUrl || ''
      }))
    }
  }

  async cancelBooking(userId: number, bookingId: number) {
    const booking = await this.bookingsRepo.findOne({ where: { id: bookingId } })
    if (!booking) throw new NotFoundException('booking not found')
    if (booking.userId !== userId) throw new NotFoundException('booking not found')
    if (booking.status !== 'CONFIRMED') throw new BadRequestException('booking already cancelled')
    if ((booking.startTime?.getTime?.() || 0) <= Date.now()) {
      throw new BadRequestException('booking already started')
    }

    booking.status = 'CANCELLED'
    await this.bookingsRepo.save(booking)
    return {
      cancelled: true,
      booking: toBookingResponse(booking)
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


  async listBookingsForAdmin(month?: string) {
    const businessNow = new Date(Date.now() + BUSINESS_TIMEZONE_OFFSET_MS)
    const fallbackMonth = `${businessNow.getUTCFullYear()}-${String(businessNow.getUTCMonth() + 1).padStart(2, '0')}`
    const monthKey = String(month || fallbackMonth)
    const match = /^(\d{4})-(\d{2})$/.exec(monthKey)
    if (!match) throw new BadRequestException('invalid month')
    const year = Number(match[1])
    const monthIndex = Number(match[2]) - 1
    if (monthIndex < 0 || monthIndex > 11) throw new BadRequestException('invalid month')
    const rangeStart = new Date(Date.UTC(year, monthIndex, 1) - BUSINESS_TIMEZONE_OFFSET_MS)
    const rangeEnd = new Date(Date.UTC(year, monthIndex + 1, 1) - BUSINESS_TIMEZONE_OFFSET_MS)
    const bookings = await this.bookingsRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .where('booking.status = :status', { status: 'CONFIRMED' })
      .andWhere('booking.start_time < :rangeEnd', { rangeEnd })
      .andWhere('booking.end_time > :rangeStart', { rangeStart })
      .orderBy('booking.start_time', 'ASC')
      .addOrderBy('booking.scene_id', 'ASC')
      .getMany()
    return {
      month: monthKey,
      range_start: rangeStart.getTime(),
      range_end: rangeEnd.getTime(),
      list: bookings.map(toBookingResponse)
    }
  }

  async createBookingForAdmin(payload: AdminBookingPayload) {
    const sceneId = normalizeInt(payload.scene_id, 0)
    const scene = sceneId ? await this.scenesRepo.findOne({ where: { id: sceneId, status: 1 } }) : null
    if (!scene) throw new BadRequestException('scene required')
    const venue = await this.venuesRepo.findOne({ where: { id: scene.venueId, status: 1 } })
    if (!venue) throw new BadRequestException('venue unavailable')
    const bookingType = payload.booking_type === 'BLOCKED' ? 'BLOCKED' : 'ADMIN'
    const customerName = String(payload.customer_name || '').trim()
    const customerPhone = String(payload.customer_phone || '').trim()
    if (bookingType === 'ADMIN' && !customerName) throw new BadRequestException('customer name required')
    const startMs = normalizeTimestamp(payload.start_time)
    const endMs = normalizeTimestamp(payload.end_time)
    const maxTime = Date.now() + 365 * 24 * 60 * 60 * 1000
    if (startMs <= Date.now() || startMs > maxTime || endMs > maxTime) throw new BadRequestException('time out of range')
    if (endMs <= startMs || startMs % HALF_HOUR_MS !== 0 || endMs % HALF_HOUR_MS !== 0) {
      throw new BadRequestException('invalid time range')
    }
    const startTimeParts = getBusinessTimeParts(startMs)
    const endTimeParts = getBusinessTimeParts(endMs)
    if (startTimeParts.dateKey !== endTimeParts.dateKey) throw new BadRequestException('invalid time range')
    if (startTimeParts.minutes < OPENING_MINUTES || endTimeParts.minutes > CLOSING_MINUTES) {
      throw new BadRequestException('outside business hours')
    }
    const conflict = await this.bookingsRepo
      .createQueryBuilder('booking')
      .where('booking.scene_id = :sceneId', { sceneId })
      .andWhere('booking.status = :status', { status: 'CONFIRMED' })
      .andWhere('booking.start_time < :endTime', { endTime: new Date(endMs) })
      .andWhere('booking.end_time > :startTime', { startTime: new Date(startMs) })
      .getOne()
    if (conflict) throw new BadRequestException('所选时段已被预约，请选择其他时间')
    const item = this.bookingsRepo.create({
      venueId: scene.venueId,
      sceneId,
      userId: null,
      bookingType,
      customerName: bookingType === 'ADMIN' ? customerName : '管理员占用',
      customerPhone: bookingType === 'ADMIN' ? customerPhone || null : null,
      createdByAdmin: 1,
      startTime: new Date(startMs),
      endTime: new Date(endMs),
      note: String(payload.note || '').trim() || undefined,
      status: 'CONFIRMED'
    })
    return toBookingResponse(await this.bookingsRepo.save(item))
  }

  async cancelBookingForAdmin(bookingId: number) {
    const booking = await this.bookingsRepo.findOne({ where: { id: bookingId } })
    if (!booking) throw new NotFoundException('booking not found')
    if (booking.status !== 'CONFIRMED') throw new BadRequestException('booking already cancelled')
    booking.status = 'CANCELLED'
    return toBookingResponse(await this.bookingsRepo.save(booking))
  }

  async createBooking(userId: number, payload: BookingPayload) {
    const sceneId = normalizeInt(payload.scene_id, 0)
    const scene = sceneId ? await this.scenesRepo.findOne({ where: { id: sceneId, status: 1 } }) : null
    if (!scene) throw new BadRequestException('scene required')
    const venue = await this.venuesRepo.findOne({ where: { id: scene.venueId, status: 1 } })
    if (!venue) throw new BadRequestException('venue unavailable')

    const startMs = normalizeTimestamp(payload.start_time)
    const endMs = normalizeTimestamp(payload.end_time)
    const { now, latest } = getAvailabilityWindow()
    if (startMs <= now || startMs > latest || endMs > latest) throw new BadRequestException('time out of range')
    if (endMs <= startMs) throw new BadRequestException('invalid time range')
    const duration = endMs - startMs
    if (startMs % HALF_HOUR_MS !== 0 || endMs % HALF_HOUR_MS !== 0) throw new BadRequestException('invalid time range')
    if (duration % HALF_HOUR_MS !== 0 || duration > 12 * 60 * 60 * 1000) throw new BadRequestException('invalid time range')
    const startTime = getBusinessTimeParts(startMs)
    const endTime = getBusinessTimeParts(endMs)
    if (startTime.dateKey !== endTime.dateKey) throw new BadRequestException('invalid time range')
    if (startTime.minutes < OPENING_MINUTES || endTime.minutes > CLOSING_MINUTES) {
      throw new BadRequestException('outside business hours')
    }

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
