import { ConflictException, Injectable } from '@nestjs/common'
import { CreatePostDto } from './dto/create-post.dto'
import { getStoredUserSummary } from '../users/users.service'
import { getCommentCountByPost } from '../comments/comments.service'
import { getLikeCountByPost } from '../likes/likes.service'
import { autoModerate } from '../../common/utils/moderation'
import { ModerationStatus } from '../../types/enums'

type PostItem = {
  id: number
  authorId: number
  title: string
  content?: string
  post_type: 'work' | 'daily'
  cover_image?: string
  images?: string[]
  tags?: string[]
  location?: string
  moderation_status: ModerationStatus
  moderation_reason?: string
  created_at: number
}

type PostResponse = {
  id: number
  author_id: number
  title: string
  content: string
  post_type: 'work' | 'daily'
  cover_image: string
  images: string[]
  tags: string[]
  location: string
  created_at: number
  like_count: number
  comment_count: number
  moderation_status: ModerationStatus
  moderation_reason: string
  user: {
    id: number
    nickname: string
    avatar: string
  }
}

let seq = 100
const POST_SUBMISSION_TTL = 5000
const recentPostSubmissions = new Map<string, number>()
const posts: PostItem[] = [
  {
    id: 1,
    authorId: 1002,
    title: '周末去拍了原神同人，真的太开心了！感谢摄影师把我都拍瘦了！',
    content: '周末去拍了原神同人，真的太开心了！感谢摄影师把我都拍瘦了！',
    post_type: 'work',
    cover_image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600'],
    tags: ['Cosplay', '正片', '原神', '广州场照'],
    location: '广州',
    moderation_status: ModerationStatus.APPROVED,
    created_at: new Date('2024-03-24T10:00:00Z').getTime()
  },
  {
    id: 2,
    authorId: 1003,
    title: '接寄拍/场照/正片，风格看主页，设备A7M4，出片快！',
    content: '接寄拍/场照/正片，风格看主页，设备A7M4，出片快！',
    post_type: 'daily',
    cover_image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600'],
    tags: ['摄影接单', '场照', '后期', '日常'],
    location: '广州',
    moderation_status: ModerationStatus.APPROVED,
    created_at: new Date('2024-03-23T15:30:00Z').getTime()
  },
  {
    id: 3,
    authorId: 1002,
    title: '有没有一起出刀剑神域的姐妹！缺个亚丝娜！',
    content: '有没有一起出刀剑神域的姐妹！缺个亚丝娜！',
    post_type: 'daily',
    cover_image: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&q=80&w=600'],
    tags: ['组队', '刀剑神域', '求组队'],
    location: '广州',
    moderation_status: ModerationStatus.APPROVED,
    created_at: new Date('2024-03-22T09:15:00Z').getTime()
  },
  {
    id: 4,
    authorId: 1004,
    title: '分享一下自制的初音未来道具，轻黏土制作教程~',
    content: '分享一下自制的初音未来道具，轻黏土制作教程~',
    post_type: 'work',
    cover_image: 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&q=80&w=600'],
    tags: ['道具教程', '初音未来', '手作'],
    location: '深圳',
    moderation_status: ModerationStatus.APPROVED,
    created_at: new Date('2024-03-21T18:20:00Z').getTime()
  },
  {
    id: 5,
    authorId: 1,
    title: '粤次元君开站啦，欢迎大家来发作品、找搭子、看活动。',
    content: '粤次元君开站啦，欢迎大家来发作品、找搭子、看活动。',
    post_type: 'daily',
    cover_image: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=600'],
    tags: ['官方', '公告', '社区'],
    location: '广州',
    moderation_status: ModerationStatus.APPROVED,
    created_at: new Date('2024-03-21T10:00:00Z').getTime()
  }
]

function toPostResponse(item: PostItem): PostResponse {
  const user = getStoredUserSummary(item.authorId) || {
    id: item.authorId,
    nickname: `用户${item.authorId}`,
    avatar: ''
  }
  const images = (item.images || []).filter(Boolean)
  return {
    id: item.id,
    author_id: item.authorId,
    title: item.title || '',
    content: item.content || '',
    post_type: item.post_type,
    cover_image: item.cover_image || images[0] || '',
    images,
    tags: (item.tags || []).filter(Boolean),
    location: item.location || '',
    created_at: item.created_at,
    like_count: getLikeCountByPost(item.id),
    comment_count: getCommentCountByPost(item.id),
    moderation_status: item.moderation_status,
    moderation_reason: item.moderation_reason || '',
    user: {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar || ''
    }
  }
}

function buildPostSubmissionKey(authorId: number, dto: CreatePostDto) {
  return JSON.stringify({
    authorId,
    title: dto.title.trim(),
    content: (dto.content || '').trim(),
    post_type: dto.post_type,
    cover_image: dto.cover_image || '',
    images: (dto.images || []).filter(Boolean),
    location: (dto.location || '').trim(),
    tags: (dto.tags || []).filter(Boolean)
  })
}

@Injectable()
export class PostsService {
  async list(params: { type?: 'work' | 'daily'; page?: number; pageSize?: number }) {
    const { type, page = 1, pageSize = 10 } = params || {}
    const visible = posts.filter(p => p.moderation_status === ModerationStatus.APPROVED)
    const filtered = type ? visible.filter(p => p.post_type === type) : visible
    const start = (page - 1) * pageSize
    const data = filtered.slice(start, start + pageSize).map(toPostResponse)
    return { list: data, total: filtered.length, page, pageSize }
  }

  async getById(id: number) {
    const item = posts.find(p => p.id === id)
    if (!item) return null
    if (item.moderation_status !== ModerationStatus.APPROVED) return null
    return toPostResponse(item)
  }

  async create(authorId: number, dto: CreatePostDto) {
    const now = Date.now()
    const submissionKey = buildPostSubmissionKey(authorId, dto)
    const recentSubmitAt = recentPostSubmissions.get(submissionKey)
    if (recentSubmitAt && now - recentSubmitAt < POST_SUBMISSION_TTL) {
      throw new ConflictException('duplicate submit')
    }
    const review = autoModerate({
      text: `${dto.title}\n${dto.content || ''}\n${(dto.tags || []).join(' ')}\n${dto.location || ''}`,
      images: dto.images || (dto.cover_image ? [dto.cover_image] : [])
    })
    const item: PostItem = {
      id: ++seq,
      authorId,
      title: dto.title.trim(),
      content: dto.content?.trim(),
      post_type: dto.post_type,
      cover_image: dto.cover_image || dto.images?.[0] || '',
      images: (dto.images || []).filter(Boolean),
      tags: (dto.tags || []).filter(Boolean),
      location: dto.location?.trim(),
      moderation_status: review.status,
      moderation_reason: review.reason,
      created_at: now
    }
    posts.unshift(item)
    recentPostSubmissions.set(submissionKey, now)
    return toPostResponse(item)
  }

  async listMine(authorId: number, page = 1, pageSize = 10) {
    const mine = posts.filter(p => p.authorId === authorId)
    const start = (page - 1) * pageSize
    const data = mine.slice(start, start + pageSize).map(toPostResponse)
    return { list: data, total: mine.length, page, pageSize }
  }

  async review(id: number, action: 'approve' | 'reject', reason?: string) {
    const item = posts.find(p => p.id === id)
    if (!item) return null
    item.moderation_status = action === 'approve' ? ModerationStatus.APPROVED : ModerationStatus.REJECTED
    item.moderation_reason = action === 'approve' ? '' : (reason || '内容审核未通过')
    return toPostResponse(item)
  }
}
