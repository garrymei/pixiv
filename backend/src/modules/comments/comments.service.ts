import { Injectable } from '@nestjs/common'
import { CreateCommentDto } from './dto/create-comment.dto'
import { getStoredUserSummary } from '../users/users.service'

type CommentItem = {
  id: number
  post_id: number
  user_id: number
  content: string
  parent_id?: number
  reply_user_id?: number
  created_at: number
}

let seq = 200
const comments: CommentItem[] = [
  { id: 1, post_id: 1, user_id: 1003, content: '这组氛围感绝了！', created_at: new Date('2024-03-24T19:00:00Z').getTime() },
  { id: 2, post_id: 1, user_id: 1, content: '欢迎多发返图，首页给你安排上。', created_at: new Date('2024-03-24T19:30:00Z').getTime() },
  { id: 3, post_id: 5, user_id: 1002, content: '收到，准备来发新正片！', created_at: new Date('2024-03-21T19:00:00Z').getTime() }
]

export function getCommentCountByPost(postId: number) {
  return comments.filter(comment => comment.post_id === postId).length
}

function toCommentResponse(item: CommentItem) {
  const user = getStoredUserSummary(item.user_id) || {
    id: item.user_id,
    nickname: `用户${item.user_id}`,
    avatar: ''
  }
  return {
    id: item.id,
    post_id: item.post_id,
    user_id: item.user_id,
    content: item.content,
    parent_id: item.parent_id ?? null,
    reply_user_id: item.reply_user_id ?? null,
    created_at: item.created_at,
    user: {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar || ''
    }
  }
}

@Injectable()
export class CommentsService {
  async listByPost(postId: number) {
    return comments.filter(c => c.post_id === postId).map(toCommentResponse)
  }

  async create(userId: number, dto: CreateCommentDto) {
    const item: CommentItem = {
      id: ++seq,
      post_id: dto.post_id,
      user_id: userId,
      content: dto.content,
      parent_id: dto.parent_id,
      reply_user_id: dto.reply_user_id,
      created_at: Date.now()
    }
    comments.unshift(item)
    return toCommentResponse(item)
  }
}
