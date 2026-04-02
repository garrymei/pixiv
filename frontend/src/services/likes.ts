import { del, get, isMockMode, mockResponse, post } from './request'

const mockState = new Map<string, { liked: boolean; like_count: number }>()

export async function getPostLikeStatus(postId: string) {
  if (isMockMode()) {
    return mockResponse(mockState.get(postId) || { liked: false, like_count: 0 })
  }
  return get<{ liked: boolean; like_count: number }>(`/likes/posts/${postId}/status`, { requireAuth: true })
}

export async function likePost(postId: string) {
  if (isMockMode()) {
    const prev = mockState.get(postId) || { liked: false, like_count: 0 }
    const next = prev.liked ? prev : { liked: true, like_count: prev.like_count + 1 }
    mockState.set(postId, next)
    return mockResponse(next)
  }
  return post<{ liked: boolean; like_count: number }>(`/likes/posts/${postId}`, {}, { requireAuth: true })
}

export async function unlikePost(postId: string) {
  if (isMockMode()) {
    const prev = mockState.get(postId) || { liked: false, like_count: 0 }
    const next = prev.liked ? { liked: false, like_count: Math.max(0, prev.like_count - 1) } : prev
    mockState.set(postId, next)
    return mockResponse(next)
  }
  return del<{ liked: boolean; like_count: number }>(`/likes/posts/${postId}`, { requireAuth: true })
}
