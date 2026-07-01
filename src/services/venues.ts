import { get, patch, post, resolveAssetUrl } from './request'

export type VenueScene = {
  id: number
  venueId: number
  name: string
  imageUrl: string
  description: string
  capacity: number | null
  status: number
}

export type Venue = {
  id: number
  name: string
  city: string
  address: string
  coverImage: string
  description: string
  status: number
  scenes: VenueScene[]
}

export type VenueBookingSlot = {
  id: number
  venueId: number
  sceneId: number
  userId: number
  startTime: number
  endTime: number
  note: string
  status: string
}

type VenueSceneRecord = {
  id: number
  venue_id: number
  name: string
  image_url?: string
  description?: string
  capacity?: number | null
  status: number
}

type VenueRecord = {
  id: number
  name: string
  city?: string
  address?: string
  cover_image?: string
  description?: string
  status: number
  scenes?: VenueSceneRecord[]
}

type VenueBookingRecord = {
  id: number
  venue_id: number
  scene_id: number
  user_id: number
  start_time?: number | null
  end_time?: number | null
  note?: string
  status?: string
}

type VenueSceneAvailabilityRecord = {
  bookings?: VenueBookingRecord[]
  window_start?: number
  window_end?: number
}

function mapScene(item: VenueSceneRecord): VenueScene {
  return {
    id: item.id,
    venueId: item.venue_id,
    name: item.name || '',
    imageUrl: resolveAssetUrl(item.image_url) || '',
    description: item.description || '',
    capacity: item.capacity ?? null,
    status: item.status
  }
}

function mapVenue(item: VenueRecord): Venue {
  const scenes = Array.isArray(item.scenes) ? item.scenes.map(mapScene) : []
  return {
    id: item.id,
    name: item.name || '',
    city: item.city || '',
    address: item.address || '',
    coverImage: resolveAssetUrl(item.cover_image) || scenes[0]?.imageUrl || '',
    description: item.description || '',
    status: item.status,
    scenes
  }
}

function mapBooking(item: VenueBookingRecord): VenueBookingSlot {
  return {
    id: item.id,
    venueId: item.venue_id,
    sceneId: item.scene_id,
    userId: item.user_id,
    startTime: Number(item.start_time || 0),
    endTime: Number(item.end_time || 0),
    note: item.note || '',
    status: item.status || ''
  }
}

export async function listVenues() {
  const data = await get<{ list: VenueRecord[] }>('/venues')
  return (data.list || []).map(mapVenue)
}

export async function createVenueBooking(payload: {
  sceneId: number
  startTime: number
  endTime: number
  note?: string
}) {
  return post(
    '/venues/bookings',
    {
      scene_id: payload.sceneId,
      start_time: payload.startTime,
      end_time: payload.endTime,
      note: payload.note
    },
    { requireAuth: true }
  )
}

export async function getSceneAvailability(sceneId: number) {
  const data = await get<VenueSceneAvailabilityRecord>(`/venues/scenes/${sceneId}/availability`)
  return {
    bookings: (data.bookings || []).map(mapBooking),
    windowStart: Number(data.window_start || 0),
    windowEnd: Number(data.window_end || 0)
  }
}

export async function cancelVenueBooking(bookingId: number) {
  return patch<{ cancelled: boolean }>(`/venues/bookings/${bookingId}/cancel`, {}, { requireAuth: true })
}
