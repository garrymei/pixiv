import { get, isMockMode, mockResponse, resolveAssetUrl } from './request'
import { mockProfileStats } from '../mocks/profile'
import { currentUser } from '../mocks/user'

type ProfileSummaryResponse = {
  user?: {
    id: number
    nickname?: string
    avatar?: string
    avatarUrl?: string
    bio?: string
    city?: string
    role_type?: string
  }
  postsCount: number
  demandsCount: number
  eventsCount: number
  demandApplicationsCount?: number
  participationCount?: number
}

export async function getProfileSummary() {
  if (!isMockMode()) {
    const data = await get<ProfileSummaryResponse>('/profile/summary', { requireAuth: true })
    return {
      user: {
        id: String(data.user?.id || ''),
        nickname: data.user?.nickname || '未命名用户',
        avatarUrl: resolveAssetUrl(data.user?.avatar || data.user?.avatarUrl) || '',
        bio: data.user?.bio || '',
        bgUrl: '',
        followersCount: 0,
        followingCount: 0,
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
        participationCount: data.participationCount || 0
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
