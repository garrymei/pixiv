import { Injectable } from '@nestjs/common'

const likesStore = new Map<number, Set<number>>()

export function getLikeCountByPost(postId: number) {
  return (likesStore.get(postId) || new Set<number>()).size
}

@Injectable()
export class LikesService {
  async like(postId: number, userId: number) {
    const set = likesStore.get(postId) || new Set<number>()
    if (set.has(userId)) {
      return { liked: true, like_count: set.size }
    }
    set.add(userId)
    likesStore.set(postId, set)
    return { liked: true, like_count: set.size }
  }

  async unlike(postId: number, userId: number) {
    const set = likesStore.get(postId) || new Set<number>()
    if (set.has(userId)) {
      set.delete(userId)
      likesStore.set(postId, set)
    }
    return { liked: false, like_count: set.size }
  }

  async status(postId: number, userId: number) {
    const set = likesStore.get(postId) || new Set<number>()
    return { liked: set.has(userId), like_count: set.size }
  }
}
