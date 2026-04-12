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
;[
  {
    id: 1,
    nickname: '粤次元君_官方',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=YueCiYuan',
    bio: '欢迎来到粤次元！这里是二次元同好的聚集地~',
    city: '广州',
    role_type: 'user'
  },
  {
    id: 1002,
    nickname: 'Coser_小樱',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sakura',
    bio: '广州同城 Coser，欢迎约拍扩列。',
    city: '广州',
    role_type: 'user'
  },
  {
    id: 1003,
    nickname: '摄影老法师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Camera',
    bio: '接寄拍/场照/正片，风格看主页，返图快。',
    city: '广州',
    role_type: 'user'
  },
  {
    id: 1004,
    nickname: '手工大佬',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Craft',
    bio: '手作、道具、教程分享中。',
    city: '深圳',
    role_type: 'user'
  },
  {
    id: 1005,
    nickname: '社团团长',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Team',
    bio: '社团招新，欢迎同好加入。',
    city: '深圳',
    role_type: 'user'
  }
].forEach((user) => store.set(user.id, user))

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
