import { get, isMockMode, mockResponse, post, resolveAssetUrl } from './request'
import { getCachedCurrentUser } from './user'
import { mockComments, type Comment } from '../mocks/comments'

type RealComment = {
  id: number
  post_id: number
  user_id: number
  content: string
  created_at: number | string
  parent_id?: number | null
  reply_user_id?: number | null
  user?: {
    id?: number
    nickname?: string
    avatar?: string
  }
}

type CommentListResponse = {
  list: RealComment[]
  total: number
}

function formatDateTime(value: number | string) {
  const timestamp = typeof value === 'number' ? value : new Date(value).getTime()
  if (!timestamp || Number.isNaN(timestamp)) return '刚刚'
  return new Date(timestamp).toLocaleString('zh-CN', { hour12: false })
}

function mapComment(item: RealComment): Comment {
  const cachedUser = getCachedCurrentUser()
  const authorId = String(item.user?.id || item.user_id)
  const isCurrentUser = cachedUser && cachedUser.id === authorId
  return {
    id: String(item.id),
    postId: String(item.post_id),
    content: item.content,
    authorId,
    authorName: isCurrentUser ? cachedUser.nickname : item.user?.nickname || (item.user_id === 1 ? '粤次元君' : `用户${item.user_id}`),
    authorAvatar: isCurrentUser ? cachedUser.avatarUrl : resolveAssetUrl(item.user?.avatar),
    likeCount: 0,
    isLiked: false,
    replyCount: 0,
    createTime: formatDateTime(item.created_at)
  }
}

export async function listCommentsByPost(postId: string): Promise<Comment[]> {
  if (!isMockMode()) {
    const data = await get<CommentListResponse>(`/comments?post_id=${postId}`)
    return (data.list || []).map(mapComment)
  }
  return mockResponse(mockComments.filter((c) => c.postId === postId))
}

export async function createComment(postId: string, content: string): Promise<Comment> {
  if (!isMockMode()) {
    const data = await post<RealComment>('/comments', { post_id: Number(postId), content }, { requireAuth: true })
    return mapComment(data)
  }

  const item: Comment = {
    id: `c_${Date.now()}`,
    postId,
    content,
    authorId: 'u_1001',
    authorName: '粤次元君_官方',
    authorAvatar: '',
    likeCount: 0,
    isLiked: false,
    replyCount: 0,
    createTime: '刚刚'
  }
  return mockResponse(item)
}
