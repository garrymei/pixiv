import Taro from '@tarojs/taro'
import { get, isMockMode, mockResponse, post, resolveAssetUrl } from './request'
import { getCachedCurrentUser } from './user'
import { mockPosts, type Post } from '../mocks/posts'

const POST_LIST_REFRESH_KEY = 'post_list_should_refresh'
const postEngagementOverrides = new Map<string, { likeCount?: number; commentCount?: number; liked?: boolean }>()

type PostRecord = {
  id: number
  authorId?: number
  author_id?: number
  authorName?: string
  author_name?: string
  authorAvatar?: string
  author_avatar?: string
  user?: {
    id?: number
    nickname?: string
    avatar?: string
  }
  title: string
  content?: string
  cover_image?: string
  images?: string[] | string | null
  tags?: string[] | string | null
  location?: string
  post_type?: 'work' | 'daily' | null
  created_at?: number | string | null
  like_count?: number | null
  comment_count?: number | null
  is_liked?: boolean | null
}

type PostListResponse = {
  list: PostRecord[]
  total: number
  page: number
  pageSize: number
}

function normalizeStringArray(value?: string[] | string | null) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string' && value) return [value]
  return []
}

function formatDateTime(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return ''
  const timestamp = typeof value === 'number' ? value : new Date(value).getTime()
  if (!timestamp || Number.isNaN(timestamp)) return ''
  return new Date(timestamp).toLocaleString('zh-CN', { hour12: false })
}

function resolveAuthor(item: PostRecord) {
  const authorId = item.user?.id || item.authorId || item.author_id || 0
  const cachedUser = getCachedCurrentUser()
  if (cachedUser && String(authorId) === cachedUser.id) {
    return {
      authorId: cachedUser.id,
      authorName: cachedUser.nickname,
      authorAvatar: cachedUser.avatarUrl
    }
  }

  return {
    authorId: String(authorId),
    authorName: item.user?.nickname || item.authorName || item.author_name || (authorId === 1 ? '粤次元君' : `用户${authorId || ''}`),
    authorAvatar: resolveAssetUrl(item.user?.avatar) || item.authorAvatar || item.author_avatar || ''
  }
}

function mapPost(item: PostRecord): Post {
  const images = normalizeStringArray(item.images).map(resolveAssetUrl).filter(Boolean)
  const tags = normalizeStringArray(item.tags)
  const cover = resolveAssetUrl(item.cover_image) || images[0] || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600'
  const author = resolveAuthor(item)
  const overrides = postEngagementOverrides.get(String(item.id))
  return {
    id: String(item.id),
    title: item.title,
    content: item.content,
    coverUrl: cover,
    images,
    authorId: author.authorId,
    authorName: author.authorName,
    authorAvatar: author.authorAvatar,
    likeCount: overrides?.likeCount ?? item.like_count ?? 0,
    commentCount: overrides?.commentCount ?? item.comment_count ?? 0,
    isLiked: overrides?.liked ?? item.is_liked ?? false,
    tags,
    createTime: formatDateTime(item.created_at) || '刚刚'
  }
}

export function markPostListShouldRefresh() {
  Taro.setStorageSync(POST_LIST_REFRESH_KEY, '1')
}

export function consumePostListShouldRefresh() {
  const next = Taro.getStorageSync(POST_LIST_REFRESH_KEY)
  if (!next) return false
  Taro.removeStorageSync(POST_LIST_REFRESH_KEY)
  return true
}

export function updatePostEngagement(postId: string, patch: { likeCount?: number; commentCount?: number; liked?: boolean }) {
  const prev = postEngagementOverrides.get(postId) || {}
  postEngagementOverrides.set(postId, { ...prev, ...patch })
}

export async function listPosts(type?: 'work' | 'daily'): Promise<Post[]> {
  if (!isMockMode()) {
    const suffix = type ? `?type=${type}` : ''
    const data = await get<PostListResponse>(`/posts${suffix}`)
    return (data.list || []).map(mapPost)
  }
  const data = type ? mockPosts.filter((p) => (type === 'work' ? p.tags.includes('正片') : p.tags.includes('日常'))) : mockPosts
  return mockResponse(data)
}

export async function listPostsByTag(tag: string): Promise<Post[]> {
  const posts = await listPosts()
  return posts.filter((p) => p.tags.includes(tag))
}

export async function listMyPosts(_userId?: string): Promise<Post[]> {
  if (!isMockMode()) {
    const data = await get<PostListResponse>('/posts/me', { requireAuth: true })
    return (data.list || []).map(mapPost)
  }
  return mockResponse(mockPosts.filter((p) => p.authorId === 'u_1001'))
}

export async function getPostById(id: string): Promise<Post | undefined> {
  if (!isMockMode()) {
    const data = await get<PostRecord | null>(`/posts/${id}`)
    return data ? mapPost(data) : undefined
  }
  return mockResponse(mockPosts.find((p) => p.id === id))
}

export async function createPost(payload: {
  title: string
  content?: string
  tags?: string[]
  location?: string
  images?: string[]
}) {
  const postType: 'work' | 'daily' = payload.tags?.includes('日常') ? 'daily' : 'work'
  const cover_image = payload.images?.[0] || ''

  if (!isMockMode()) {
    const data = await post<PostRecord>(
      '/posts',
      {
        title: payload.title,
        content: payload.content,
        tags: payload.tags || [],
        location: payload.location,
        images: payload.images || [],
        cover_image,
        post_type: postType
      },
      { requireAuth: true }
    )
    return mapPost(data)
  }

  const item: Post = {
    id: `p_${Date.now()}`,
    title: payload.title,
    content: payload.content,
    coverUrl: cover_image,
    images: payload.images || [],
    authorId: 'u_1001',
    authorName: '粤次元君_官方',
    authorAvatar: '',
    likeCount: 0,
    commentCount: 0,
    isLiked: false,
    tags: payload.tags || [],
    createTime: new Date().toISOString()
  }
  return mockResponse(item)
}
