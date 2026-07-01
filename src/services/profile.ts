import { get, getSessionUser, hasAuthenticatedSession, isGuestSession, isMockMode, mockResponse, resolveAssetUrl } from './request'
import { mockProfileStats } from '../mocks/profile'
import { currentUser } from '../mocks/user'
import { mockProfileTabs } from '../mocks/profile'

type ProfileSummaryResponse = {
  user?: {
    id: number
    nickname?: string
    avatar?: string
    avatarUrl?: string
    avatar_pending?: string
    bg_url?: string
    bio?: string
    city?: string
    role_type?: string
    followers_count?: number
    following_count?: number
  }
  postsCount: number
  demandsCount: number
  eventsCount: number
  demandApplicationsCount?: number
  participationCount?: number
  venueBookingsCount?: number
}

type MyBookingRecord = {
  id: string
  biz_type: 'event_registration' | 'venue_booking' | 'demand_created' | 'demand_applied'
  title?: string
  subtitle?: string
  status?: string
  start_time?: number | null
  end_time?: number | null
  display_time?: string
  location?: string
  cover_image?: string
  target_id?: number
  venue_id?: number
  scene_id?: number
  registered_at?: number | null
  created_at?: number | null
  action_text?: string
  cancelable?: boolean
}

export type MyBookingItem = {
  id: string
  bizType: 'event_registration' | 'venue_booking' | 'demand_created' | 'demand_applied'
  title: string
  subtitle: string
  status: string
  displayTime: string
  location: string
  coverImage: string
  targetId: number
  venueId?: number
  sceneId?: number
  actionText: string
  sortTime: number
  cancelable: boolean
}

export async function getProfileSummary() {
  if (!isMockMode()) {
    if (isGuestSession()) {
      const session = getSessionUser()
      return {
        user: {
          id: '0',
          nickname: session?.nickname || '游客',
          avatarUrl: '',
          bio: '当前为游客模式，仅支持浏览内容。',
          bgUrl: '',
          followersCount: 0,
          followingCount: 0,
          city: '',
          roleType: 'guest'
        },
        stats: {
          postsCount: 0,
          demandsCount: 0,
          eventsCount: 0,
          favoritesCount: 0,
          likesReceived: 0,
          visitors: 0,
          demandApplicationsCount: 0,
          participationCount: 0,
          venueBookingsCount: 0
        }
      }
    }

    if (!hasAuthenticatedSession()) {
      throw new Error('请先登录后查看个人中心')
    }

    const data = await get<ProfileSummaryResponse>('/profile/summary', { requireAuth: true })
    return {
      user: {
        id: String(data.user?.id || ''),
        nickname: data.user?.nickname || '未命名用户',
        avatarUrl: resolveAssetUrl(data.user?.avatar || data.user?.avatarUrl || data.user?.avatar_pending) || '',
        bio: data.user?.bio || '',
        bgUrl: data.user?.bg_url || '',
        followersCount: data.user?.followers_count || 0,
        followingCount: data.user?.following_count || 0,
        city: data.user?.city || '',
        roleType: data.user?.role_type || 'user'
      },
      stats: {
        postsCount: data.postsCount || 0,
        demandsCount: data.demandsCount || 0,
        eventsCount: data.eventsCount || 0,
        favoritesCount: 0,
        likesReceived: 0,
        visitors: 0,
        demandApplicationsCount: data.demandApplicationsCount || 0,
        participationCount: data.participationCount || 0,
        venueBookingsCount: data.venueBookingsCount || 0
      }
    }
  }

  return mockResponse({
    user: currentUser,
    stats: mockProfileStats
  })
}

export async function getProfileStats() {
  if (!isMockMode()) {
    const data = await getProfileSummary()
    return data.stats
  }
  return mockResponse(mockProfileStats)
}

export async function getMyBookings() {
  if (isMockMode()) {
    return mockResponse(
      (mockProfileTabs.events || []).map<MyBookingItem>((item: any) => ({
        id: `event-${item.id}`,
        bizType: 'event_registration',
        title: item.title || '活动报名',
        subtitle: item.organizer || '官方活动',
        status: item.status === 'ended' ? '已结束' : item.status === 'ongoing' ? '进行中' : '即将开始',
        displayTime: item.time || '',
        location: item.location || '',
        coverImage: item.coverUrl || '',
        targetId: Number(item.id || 0),
        actionText: '查看活动详情',
        sortTime: 0,
        cancelable: false
      }))
    )
  }
  const data = await get<{ list: MyBookingRecord[] }>('/profile/my-bookings', { requireAuth: true })
  return (data.list || []).map<MyBookingItem>((item) => ({
    id: item.id,
    bizType: item.biz_type,
    title: item.title || '未命名预约',
    subtitle: item.subtitle || '',
    status: item.status || '',
    displayTime: item.display_time || '',
    location: item.location || '',
    coverImage: resolveAssetUrl(item.cover_image) || '',
    targetId: Number(item.target_id || 0),
    venueId: item.venue_id ? Number(item.venue_id) : undefined,
    sceneId: item.scene_id ? Number(item.scene_id) : undefined,
    actionText: item.action_text || '查看详情',
    sortTime: Number(item.start_time || item.registered_at || item.created_at || 0),
    cancelable: !!item.cancelable
  }))
}
