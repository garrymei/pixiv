import { get, getSessionUser, hasAuthenticatedSession, isGuestSession, isMockMode, mockResponse, resolveAssetUrl } from './request'
import { mockProfileStats } from '../mocks/profile'
import { currentUser } from '../mocks/user'

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
          participationCount: 0
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
