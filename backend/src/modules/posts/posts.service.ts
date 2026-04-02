import { ConflictException, Injectable } from '@nestjs/common'
import { CreatePostDto } from './dto/create-post.dto'
import { getStoredUserSummary } from '../users/users.service'
import { getCommentCountByPost } from '../comments/comments.service'
import { getLikeCountByPost } from '../likes/likes.service'

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
    authorId: 1,
    title: '正片·初音未来',
    content: '拍摄于广州塔，夜景霓虹',
    post_type: 'work',
    cover_image: '',
    images: [],
    tags: ['cos', 'miku'],
    location: '广州',
    created_at: Date.now()
  },
  {
    id: 2,
    authorId: 1,
    title: '日常·场记',
    content: '今天在海心沙踩点',
    post_type: 'daily',
    cover_image: '',
    images: [],
    tags: ['daily'],
    location: '广州',
    created_at: Date.now()
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
    const filtered = type ? posts.filter(p => p.post_type === type) : posts
    const start = (page - 1) * pageSize
    const data = filtered.slice(start, start + pageSize).map(toPostResponse)
    return { list: data, total: filtered.length, page, pageSize }
  }

  async getById(id: number) {
    const item = posts.find(p => p.id === id)
    return item ? toPostResponse(item) : null
  }

  async create(authorId: number, dto: CreatePostDto) {
    const now = Date.now()
    const submissionKey = buildPostSubmissionKey(authorId, dto)
    const recentSubmitAt = recentPostSubmissions.get(submissionKey)
    if (recentSubmitAt && now - recentSubmitAt < POST_SUBMISSION_TTL) {
      throw new ConflictException('duplicate submit')
    }
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
}
