import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../database/entities/user.entity'

type LoginPayload = {
  mockId?: string
  nickname?: string
}

const loginPresets: Record<string, Partial<User> & { id?: number }> = {
  dev: {
    id: 1,
    nickname: '粤次元君_官方',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=YueCiYuan',
    bio: '欢迎来到粤次元！这里是二次元同好的聚集地~',
    city: '广州',
    roleType: 'user'
  },
  u_1001: {
    id: 1,
    nickname: '粤次元君_官方',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=YueCiYuan',
    bio: '欢迎来到粤次元！这里是二次元同好的聚集地~',
    city: '广州',
    roleType: 'user'
  },
  u_1002: {
    id: 1002,
    nickname: 'Coser_小樱',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sakura',
    bio: '广州同城 Coser，欢迎约拍扩列。',
    city: '广州',
    roleType: 'user'
  },
  u_1003: {
    id: 1003,
    nickname: '摄影老法师',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Camera',
    bio: '接寄拍/场照/正片，风格看主页，返图快。',
    city: '广州',
    roleType: 'user'
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>
  ) {}

  private async resolveLoginUser(payload: LoginPayload) {
    const key = payload.mockId || 'dev'
    const preset = loginPresets[key]
    const parsedId = /^u_(\d+)$/.test(key) ? Number(key.replace(/^u_/, '')) : undefined
    const preferredId = preset?.id || parsedId
    let user = preferredId ? await this.usersRepo.findOne({ where: { id: preferredId } }) : null

    if (!user && preset?.nickname) {
      user = await this.usersRepo.findOne({ where: { nickname: preset.nickname } })
    }

    if (!user) {
      user = this.usersRepo.create({
        id: preferredId,
        nickname: payload.nickname?.trim() || preset?.nickname || `用户${preferredId || ''}` || '未命名用户',
        avatarUrl: preset?.avatarUrl || '',
        bio: preset?.bio || '',
        city: preset?.city || '',
        roleType: preset?.roleType || 'user'
      })
    } else {
      if (payload.nickname?.trim()) user.nickname = payload.nickname.trim()
      if (!user.avatarUrl && preset?.avatarUrl) user.avatarUrl = preset.avatarUrl
      if (!user.bio && preset?.bio) user.bio = preset.bio
      if (!user.city && preset?.city) user.city = preset.city
      if (!user.roleType) user.roleType = preset?.roleType || 'user'
    }

    return this.usersRepo.save(user)
  }

  async login(payload: LoginPayload) {
    const user = await this.resolveLoginUser(payload)
    const token = await this.jwt.signAsync({ sub: user.id })
    return {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatarUrl || '',
        bio: user.bio || '',
        city: user.city || '',
        role_type: user.roleType || 'user'
      }
    }
  }

  async mockLogin(payload: LoginPayload) {
    return this.login(payload)
  }

  async verifyToken(token: string) {
    return this.jwt.verifyAsync<{ sub: number }>(token)
  }
}
