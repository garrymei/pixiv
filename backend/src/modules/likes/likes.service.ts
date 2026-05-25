import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Like } from '../../database/entities/like.entity'
import { Post } from '../../database/entities/post.entity'
import { ModerationStatus } from '../../types/enums'

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likesRepo: Repository<Like>,
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>
  ) {}

  async like(postId: number, userId: number) {
    const post = await this.postsRepo.findOne({ where: { id: postId } })
    if (!post || post.moderationStatus !== ModerationStatus.APPROVED) {
      throw new NotFoundException('post not found')
    }

    const existing = await this.likesRepo.findOne({ where: { postId, userId } })
    if (existing) {
      const likeCount = await this.likesRepo.count({ where: { postId } })
      return { liked: true, like_count: likeCount }
    }
    await this.likesRepo.save(this.likesRepo.create({ postId, userId }))
    await this.postsRepo.increment({ id: postId }, 'likeCount', 1)
    const likeCount = await this.likesRepo.count({ where: { postId } })
    return { liked: true, like_count: likeCount }
  }

  async unlike(postId: number, userId: number) {
    const existing = await this.likesRepo.findOne({ where: { postId, userId } })
    if (existing) {
      await this.likesRepo.remove(existing)
      const post = await this.postsRepo.findOne({ where: { id: postId } })
      if (post && post.likeCount > 0) {
        post.likeCount -= 1
        await this.postsRepo.save(post)
      }
    }
    const likeCount = await this.likesRepo.count({ where: { postId } })
    return { liked: false, like_count: likeCount }
  }

  async status(postId: number, userId: number) {
    const post = await this.postsRepo.findOne({ where: { id: postId } })
    if (!post || post.moderationStatus !== ModerationStatus.APPROVED) {
      throw new NotFoundException('post not found')
    }

    const [existing, likeCount] = await Promise.all([
      this.likesRepo.findOne({ where: { postId, userId } }),
      this.likesRepo.count({ where: { postId } })
    ])
    return { liked: !!existing, like_count: likeCount }
  }
}
