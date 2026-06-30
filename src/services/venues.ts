import { get, post, resolveAssetUrl } from './request'

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
