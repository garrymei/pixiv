export interface User {
  id: string
  nickname: string
  avatarUrl?: string
  bio?: string
  bgUrl?: string
  followersCount: number
  followingCount: number
  isFollowing?: boolean
}

export const currentUser: User = {
  id: 'u_1001',
  nickname: '粤次元君_官方',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=YueCiYuan',
  bio: '欢迎来到粤次元！这里是二次元同好的聚集地~',
  bgUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=1000',
  followersCount: 12500,
  followingCount: 128
}

export const mockUsers: Record<string, User> = {
  'u_1002': {
    id: 'u_1002',
    nickname: 'Coser_小樱',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sakura',
    followersCount: 342,
    followingCount: 56,
    isFollowing: false
  },
  'u_1003': {
    id: 'u_1003',
    nickname: '摄影老法师',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Camera',
    followersCount: 890,
    followingCount: 120,
    isFollowing: true
  }
}