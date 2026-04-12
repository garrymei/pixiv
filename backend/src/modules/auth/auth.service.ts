import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

type MockLoginPayload = {
  mockId?: string
  nickname?: string
}

const mockUsers = new Map<string, any>()
mockUsers.set('dev', {
  id: 1,
  nickname: '粤次元君_官方',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=YueCiYuan',
  bio: '欢迎来到粤次元！这里是二次元同好的聚集地~',
  city: '广州',
  role_type: 'user'
})
mockUsers.set('u_1001', mockUsers.get('dev'))
mockUsers.set('u_1002', {
  id: 1002,
  nickname: 'Coser_小樱',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sakura',
  bio: '广州同城 Coser，欢迎约拍扩列。',
  city: '广州',
  role_type: 'user'
})
mockUsers.set('u_1003', {
  id: 1003,
  nickname: '摄影老法师',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Camera',
  bio: '接寄拍/场照/正片，风格看主页，返图快。',
  city: '广州',
  role_type: 'user'
})

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async mockLogin(payload: MockLoginPayload) {
    const key = payload.mockId || 'dev'
    const base = mockUsers.get(key) || {
      id: 2000,
      nickname: payload.nickname || `mock-${key}`,
      avatarUrl: '',
      bio: '',
      city: '',
      role_type: 'user'
    }
    const token = await this.jwt.signAsync({ sub: base.id })
    return { token, user: base }
  }

  async verifyToken(token: string) {
    return this.jwt.verifyAsync<{ sub: number }>(token)
  }
}
