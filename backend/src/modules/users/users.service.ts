import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { autoModerate } from '../../common/utils/moderation'
import { ModerationStatus } from '../../types/enums'
import { User } from '../../database/entities/user.entity'

export type UserSummary = {
  id: number
  avatar?: string
  bg_url?: string
  avatar_pending?: string
  avatar_review_status?: ModerationStatus
  avatar_review_reason?: string
  nickname: string
  bio?: string
  city?: string
  role_type?: string
  followers_count?: number
  following_count?: number
}

function normalizeUserSummary(user: Partial<UserSummary> & { id: number }): UserSummary {
  return {
    id: user.id,
    nickname: user.nickname || '未命名用户',
    avatar: user.avatar || '',
    avatar_pending: user.avatar_pending || '',
    avatar_review_status: user.avatar_review_status || ModerationStatus.APPROVED,
    avatar_review_reason: user.avatar_review_reason || '',
    bio: user.bio || '',
    city: user.city || '',
    role_type: user.role_type || 'user',
    bg_url: user.bg_url || '',
    followers_count: user.followers_count || 0,
    following_count: user.following_count || 0
  }
}

function toUserSummary(user: User | null): UserSummary | null {
  if (!user) return null
  return normalizeUserSummary({
    id: user.id,
    nickname: user.nickname,
    avatar: user.avatarUrl,
    avatar_pending: user.avatarPending,
    avatar_review_status: user.avatarReviewStatus,
    avatar_review_reason: user.avatarReviewReason,
    bio: user.bio,
    city: user.city,
    role_type: user.roleType,
    bg_url: user.bgUrl,
    followers_count: user.followersCount,
    following_count: user.followingCount
  })
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>
  ) {}

  async getCurrentUser(userId: number): Promise<UserSummary | null> {
    return toUserSummary(await this.usersRepo.findOne({ where: { id: userId } }))
  }

  async updateCurrentUser(userId: number, dto: Partial<UserSummary>): Promise<UserSummary> {
    const current = await this.usersRepo.findOne({ where: { id: userId } })
    const entity = current || this.usersRepo.create({ id: userId, nickname: dto.nickname || '未命名用户' })

    if (typeof dto.nickname === 'string' && dto.nickname.trim()) entity.nickname = dto.nickname.trim()
    if (typeof dto.bio === 'string') entity.bio = dto.bio.trim()
    if (typeof dto.city === 'string') entity.city = dto.city.trim()
    if (typeof dto.role_type === 'string' && dto.role_type.trim()) entity.roleType = dto.role_type.trim()

    if (dto.avatar !== undefined) {
      const nextAvatar = String(dto.avatar || '')
      const review = autoModerate({ images: [nextAvatar] })
      if (review.status === ModerationStatus.APPROVED) {
        entity.avatarUrl = nextAvatar
        entity.avatarPending = ''
        entity.avatarReviewStatus = ModerationStatus.APPROVED
        entity.avatarReviewReason = ''
      } else {
        entity.avatarPending = nextAvatar
        entity.avatarReviewStatus = ModerationStatus.PENDING
        entity.avatarReviewReason = review.reason || '头像待人工审核'
      }
    }

    const saved = await this.usersRepo.save(entity)
    return toUserSummary(saved) as UserSummary
  }

  async getUserById(id: number): Promise<UserSummary | null> {
    return toUserSummary(await this.usersRepo.findOne({ where: { id } }))
  }

  async reviewAvatar(userId: number, action: 'approve' | 'reject', reason?: string): Promise<UserSummary | null> {
    const current = await this.usersRepo.findOne({ where: { id: userId } })
    if (!current) return null

    if (action === 'approve') {
      if (current.avatarPending) {
        current.avatarUrl = current.avatarPending
      }
      current.avatarPending = ''
      current.avatarReviewStatus = ModerationStatus.APPROVED
      current.avatarReviewReason = ''
    } else {
      current.avatarPending = ''
      current.avatarReviewStatus = ModerationStatus.REJECTED
      current.avatarReviewReason = reason || '头像审核未通过'
    }

    const saved = await this.usersRepo.save(current)
    return toUserSummary(saved)
  }
}
