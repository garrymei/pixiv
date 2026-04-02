import { Injectable } from '@nestjs/common'

export type UserSummary = {
  id: number
  avatar?: string
  nickname: string
  bio?: string
  city?: string
  role_type?: string
}

const store = new Map<number, UserSummary>()
store.set(1, {
  id: 1,
  nickname: '粤次元君',
  avatar: '',
  bio: '二次元同好聚集地',
  city: '广州',
  role_type: 'user'
})

export function normalizeUserSummary(user: Partial<UserSummary> & { id: number }): UserSummary {
  return {
    id: user.id,
    nickname: user.nickname || '未命名用户',
    avatar: user.avatar || '',
    bio: user.bio || '',
    city: user.city || '',
    role_type: user.role_type || 'user'
  }
}

export function getStoredUserSummary(userId: number): UserSummary | null {
  const user = store.get(userId)
  return user ? normalizeUserSummary(user) : null
}

@Injectable()
export class UsersService {
  async getCurrentUser(userId: number): Promise<UserSummary | null> {
    return getStoredUserSummary(userId)
  }

  async updateCurrentUser(userId: number, dto: Partial<UserSummary>): Promise<UserSummary> {
    const prev = getStoredUserSummary(userId) || normalizeUserSummary({ id: userId, nickname: '未命名用户' })
    const next = normalizeUserSummary({ ...prev, ...dto, id: userId })
    store.set(userId, next)
    return next
  }

  async getUserById(id: number): Promise<UserSummary | null> {
    return getStoredUserSummary(id)
  }
}
