import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

type MockLoginPayload = {
  mockId?: string
  nickname?: string
}

const mockUsers = new Map<string, any>()
mockUsers.set('dev', {
  id: 1,
  nickname: '粤次元君',
  avatarUrl: '',
  bio: '二次元同好聚集地',
  city: '广州',
  role_type: 'user'
})

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async mockLogin(payload: MockLoginPayload) {
    const key = payload.mockId || 'dev'
    const base = mockUsers.get(key) || {
      id: 2,
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
