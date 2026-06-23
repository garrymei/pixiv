import Taro from '@tarojs/taro'
import { clearAuthState, ensureToken, get, getSessionUser, hasAuthenticatedSession, isGuestSession, isMockMode, mockResponse, patch, resolveAssetUrl, setSessionUser, type SessionUser } from './request'
import { currentUser } from '../mocks/user'

export type AvatarReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

type UserRecord = {
  id: number
  nickname: string
  avatar?: string
  avatarUrl?: string
  bg_url?: string
  avatar_pending?: string
  avatar_review_status?: AvatarReviewStatus
  avatar_review_reason?: string
  bio?: string
  city?: string
  role_type?: string
  followers_count?: number
  following_count?: number
  profile_complete?: boolean
}

export type CurrentUser = {
  id: string
  nickname: string
  avatarUrl: string
  bio: string
  bgUrl: string
  followersCount: number
  followingCount: number
  city: string
  roleType: string
  avatarReviewStatus?: AvatarReviewStatus
  avatarReviewReason?: string
  avatarPendingUrl?: string
  profileComplete?: boolean
}

const CURRENT_USER_KEY = 'current_user_profile'

let currentUserPromise: Promise<CurrentUser> | null = null

function mapUser(data: UserRecord | SessionUser | null): CurrentUser {
  return {
    id: String(data?.id || ''),
    nickname: data?.nickname || '未命名用户',
    avatarUrl: resolveAssetUrl(data?.avatar || data?.avatarUrl || ''),
    bio: data?.bio || '',
    bgUrl: (data as UserRecord | null)?.bg_url || '',
    followersCount: (data as UserRecord | null)?.followers_count || 0,
    followingCount: (data as UserRecord | null)?.following_count || 0,
    city: data?.city || '',
    roleType: data?.role_type || 'user',
    avatarReviewStatus: (data as UserRecord | null)?.avatar_review_status,
    avatarReviewReason: (data as UserRecord | null)?.avatar_review_reason || '',
    avatarPendingUrl: resolveAssetUrl((data as UserRecord | null)?.avatar_pending || ''),
    profileComplete:
      (data as UserRecord | null)?.profile_complete ??
      !!(data?.nickname && data.nickname !== '微信用户')
  }
}

function writeCachedCurrentUser(user: CurrentUser | null) {
  if (!user) {
    Taro.removeStorageSync(CURRENT_USER_KEY)
    return
  }
  Taro.setStorageSync(CURRENT_USER_KEY, user)
}

function syncSessionUser(user: CurrentUser) {
  const userId = Number(user.id)
  setSessionUser({
    id: Number.isNaN(userId) ? 0 : userId,
    nickname: user.nickname,
    avatar: user.avatarUrl,
    bio: user.bio,
    city: user.city,
    role_type: user.roleType,
    profile_complete: user.profileComplete
  })
}

export async function bootstrapCurrentUser() {
  if (isMockMode()) return mockResponse(currentUser as CurrentUser)
  if (isGuestSession()) {
    return mapUser(getSessionUser())
  }
  return getCurrentUser(true)
}

export function clearCurrentUser() {
  writeCachedCurrentUser(null)
  clearAuthState()
}

export async function getCurrentUser(forceRefresh = false): Promise<CurrentUser> {
  if (isMockMode()) {
    return mockResponse({
      id: currentUser.id,
      nickname: currentUser.nickname,
      avatarUrl: currentUser.avatarUrl || '',
      bio: currentUser.bio || '',
      bgUrl: currentUser.bgUrl || '',
      followersCount: currentUser.followersCount,
      followingCount: currentUser.followingCount,
      city: '',
      roleType: 'user'
    })
  }

  if (isGuestSession()) {
    return mapUser(getSessionUser())
  }

  if (!hasAuthenticatedSession()) {
    return mapUser(null)
  }

  if (!currentUserPromise || forceRefresh) {
    currentUserPromise = (async () => {
      await ensureToken()
      const data = await get<UserRecord | null>('/users/me', { requireAuth: true })
      const mapped = mapUser(data)
      writeCachedCurrentUser(mapped)
      syncSessionUser(mapped)
      return mapped
    })().finally(() => {
      currentUserPromise = null
    })
  }

  return currentUserPromise
}

export async function updateCurrentUser(payload: { nickname: string; bio?: string; city?: string; roleType?: string; avatar?: string }): Promise<CurrentUser> {
  if (!isMockMode()) {
    const data = await patch<UserRecord>('/users/me', {
      nickname: payload.nickname,
      bio: payload.bio,
      city: payload.city,
      role_type: payload.roleType,
      avatar: payload.avatar
    }, { requireAuth: true })
    const mapped = mapUser(data)
    writeCachedCurrentUser(mapped)
    syncSessionUser(mapped)
    return mapped
  }

  return mockResponse({
    ...currentUser,
    id: currentUser.id,
    nickname: payload.nickname,
    avatarUrl: currentUser.avatarUrl || '',
    bio: payload.bio || '',
    bgUrl: currentUser.bgUrl || '',
    followersCount: currentUser.followersCount,
    followingCount: currentUser.followingCount,
    city: payload.city || '',
    roleType: payload.roleType || 'user',
    avatarReviewStatus: 'APPROVED',
    avatarReviewReason: '',
    avatarPendingUrl: ''
  } satisfies CurrentUser)
}
