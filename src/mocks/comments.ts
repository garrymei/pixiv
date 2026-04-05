import { mockUsers } from './user'

export interface Comment {
  id: string
  postId: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  likeCount: number
  isLiked: boolean
  replyCount: number
  createTime: string
}

export const mockComments: Comment[] = [
  {
    id: 'c_1',
    postId: 'p_1',
    content: '哇！太好看了吧！我也想去拍！这套衣服在哪买的呀？',
    authorId: mockUsers['u_1003'].id,
    authorName: mockUsers['u_1003'].nickname,
    authorAvatar: mockUsers['u_1003'].avatarUrl,
    likeCount: 12,
    isLiked: false,
    replyCount: 2,
    createTime: '2小时前'
  },
  {
    id: 'c_2',
    postId: 'p_1',
    content: '摄影师也很给力，光影处理得绝了。',
    authorId: mockUsers['u_1002'].id,
    authorName: mockUsers['u_1002'].nickname,
    authorAvatar: mockUsers['u_1002'].avatarUrl,
    likeCount: 5,
    isLiked: true,
    replyCount: 0,
    createTime: '3小时前'
  },
  {
    id: 'c_3',
    postId: 'p_1',
    content: '下次漫展一起来玩呀~',
    authorId: 'u_1006',
    authorName: '路人甲',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Passerby',
    likeCount: 0,
    isLiked: false,
    replyCount: 0,
    createTime: '5小时前'
  }
]