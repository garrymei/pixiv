import { currentUser } from './user'
import { mockPosts } from './posts'
import { mockDemands } from './demands'
import { mockEvents } from './events'

export const mockProfileStats = {
  postsCount: 15,
  demandsCount: 3,
  eventsCount: 5,
  favoritesCount: 128,
  likesReceived: 4560,
  visitors: 342
}

export const mockProfileTabs = {
  posts: mockPosts.filter(p => p.authorId === currentUser.id),
  demands: mockDemands.filter(d => d.authorId === currentUser.id),
  events: [mockEvents[0]] // 假装参加了第一个活动
}