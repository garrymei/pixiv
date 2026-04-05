import Taro from '@tarojs/taro'
import { bootstrapSession, clearAuthState, ensureToken, get, getSessionUser, isMockMode, mockResponse, patch, setSessionUser, type SessionUser } from './request'
import { currentUser } from '../mocks/user'

type UserRecord = {
  id: number
  nickname: string
  avatar?: string
  avatarUrl?: string
  bio?: string
  city?: string
  role_type?: string
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
}

const CURRENT_USER_KEY = 'current_user_profile'

let currentUserPromise: Promise<CurrentUser> | null = null

function mapUser(data: UserRecord | SessionUser | null): CurrentUser {
  return {
    id: String(data?.id || ''),
    nickname: data?.nickname || '未命名用户',
    avatarUrl: data?.avatar || data?.avatarUrl || '',
    bio: data?.bio || '',
    bgUrl: '',
    followersCount: 0,
    followingCount: 0,
    city: data?.city || '',
    roleType: data?.role_type || 'user'
  }
}

function readCachedCurrentUser() {
  return Taro.getStorageSync(CURRENT_USER_KEY) as CurrentUser | null
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
    role_type: user.roleType
  })
}

export async function bootstrapCurrentUser() {
  if (isMockMode()) return mockResponse(currentUser as CurrentUser)
  await bootstrapSession()
  return getCurrentUser(true)
}

export function clearCurrentUser() {
  writeCachedCurrentUser(null)
  clearAuthState()
}

export function getCachedCurrentUser() {
  if (isMockMode()) return currentUser as CurrentUser
  return readCachedCurrentUser()
}

export async function getCurrentUser(forceRefresh = false): Promise<CurrentUser> {
  if (!isMockMode()) {
    const cached = !forceRefresh ? readCachedCurrentUser() : null
    if (cached) return cached

    if (!currentUserPromise || forceRefresh) {
      currentUserPromise = (async () => {
        await ensureToken()
        const data = await get<UserRecord | null>('/users/me', { requireAuth: true })
        const mapped = mapUser(data || getSessionUser())
        writeCachedCurrentUser(mapped)
        syncSessionUser(mapped)
        return mapped
      })().finally(() => {
        currentUserPromise = null
      })
    }

    return currentUserPromise
  }
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

export async function updateCurrentUser(payload: { nickname: string; bio?: string; city?: string; roleType?: string }) {
  if (!isMockMode()) {
    const data = await patch<UserRecord>('/users/me', {
      nickname: payload.nickname,
      bio: payload.bio,
      city: payload.city,
      role_type: payload.roleType
    }, { requireAuth: true })
    const mapped = mapUser(data)
    writeCachedCurrentUser(mapped)
    syncSessionUser(mapped)
    return mapped
  }

  return mockResponse({
    ...currentUser,
    nickname: payload.nickname,
    bio: payload.bio || '',
    city: payload.city || '',
    roleType: payload.roleType || 'user'
  })
}
