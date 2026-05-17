import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateCommentDto } from './dto/create-comment.dto'
import { Comment } from '../../database/entities/comment.entity'
import { User } from '../../database/entities/user.entity'
import { Post } from '../../database/entities/post.entity'

function toCommentResponse(item: Comment) {
  const user = item.author
  return {
    id: item.id,
    post_id: item.postId,
    user_id: item.authorId,
    content: item.content,
    parent_id: item.parentId ?? null,
    reply_user_id: item.replyUserId ?? null,
    created_at: item.createdAt?.getTime?.() || Date.now(),
    user: {
      id: user?.id || item.authorId,
      nickname: user?.nickname || `用户${item.authorId}`,
      avatar: user?.avatarUrl || ''
    }
  }
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>
  ) {}

  async listByPost(postId: number) {
    const list = await this.commentsRepo.find({
      where: { postId },
      relations: { author: true },
      order: { createdAt: 'DESC', id: 'DESC' }
    })
    return list.map(toCommentResponse)
  }

  async create(userId: number, dto: CreateCommentDto) {
    const item = await this.commentsRepo.save(this.commentsRepo.create({
      postId: dto.post_id,
      authorId: userId,
      content: dto.content.trim(),
      parentId: dto.parent_id,
      replyUserId: dto.reply_user_id
    }))
    await this.postsRepo.increment({ id: dto.post_id }, 'commentCount', 1)
    const author = await this.usersRepo.findOne({ where: { id: userId } })
    return toCommentResponse({ ...item, author: author || undefined } as Comment)
  }
}
