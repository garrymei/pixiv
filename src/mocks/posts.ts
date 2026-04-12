import { mockUsers } from './user'

export interface Post {
  id: string
  title: string
  content?: string
  coverUrl: string
  images?: string[]
  authorId: string
  authorName: string
  authorAvatar?: string
  likeCount: number
  commentCount: number
  isLiked?: boolean
  tags: string[]
  createTime: string
}

export const mockPosts: Post[] = [
  {
    id: 'p_1',
    title: '周末去拍了原神同人，真的太开心了！感谢摄影师把我都拍瘦了！',
    coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600',
    authorId: mockUsers['u_1002'].id,
    authorName: mockUsers['u_1002'].nickname,
    authorAvatar: mockUsers['u_1002'].avatarUrl,
    likeCount: 1256,
    commentCount: 89,
    isLiked: false,
    tags: ['Cosplay', '正片', '原神', '广州场照'],
    createTime: '2024-03-24T10:00:00Z'
  },
  {
    id: 'p_2',
    title: '接寄拍/场照/正片，风格看主页，设备A7M4，出片快！',
    coverUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
    authorId: mockUsers['u_1003'].id,
    authorName: mockUsers['u_1003'].nickname,
    authorAvatar: mockUsers['u_1003'].avatarUrl,
    likeCount: 45,
    commentCount: 12,
    isLiked: true,
    tags: ['摄影接单', '场照', '后期', '日常'],
    createTime: '2024-03-23T15:30:00Z'
  },
  {
    id: 'p_3',
    title: '有没有一起出刀剑神域的姐妹！缺个亚丝娜！',
    coverUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&q=80&w=600',
    authorId: mockUsers['u_1002'].id,
    authorName: mockUsers['u_1002'].nickname,
    authorAvatar: mockUsers['u_1002'].avatarUrl,
    likeCount: 320,
    commentCount: 45,
    isLiked: false,
    tags: ['组队', '刀剑神域', '求组队'],
    createTime: '2024-03-22T09:15:00Z'
  },
  {
    id: 'p_4',
    title: '分享一下自制的初音未来道具，轻黏土制作教程~',
    coverUrl: 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&q=80&w=600',
    authorId: 'u_1004',
    authorName: '手工大佬',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Craft',
    likeCount: 2100,
    commentCount: 340,
    isLiked: false,
    tags: ['道具教程', '初音未来', '手作'],
    createTime: '2024-03-21T18:20:00Z'
  },
  {
    id: 'p_5',
    title: '最近广州的漫展总结，这些场馆真的太好拍了！',
    coverUrl: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=600',
    authorId: mockUsers['u_1002'].id,
    authorName: mockUsers['u_1002'].nickname,
    authorAvatar: mockUsers['u_1002'].avatarUrl,
    likeCount: 890,
    commentCount: 156,
    isLiked: false,
    tags: ['漫展返图', '广州', '日常'],
    createTime: '2024-03-20T14:10:00Z'
  },
  {
    id: 'p_6',
    title: '试了新的妆面，感觉很适合出赛博朋克风的角色',
    coverUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=600',
    authorId: 'u_1006',
    authorName: '美妆小天才',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Makeup',
    likeCount: 345,
    commentCount: 67,
    isLiked: true,
    tags: ['妆容分享', '赛博朋克', '日常'],
    createTime: '2024-03-19T20:45:00Z'
  },
  {
    id: 'p_7',
    title: '【正片】明日方舟 琴柳 - 鹤雪尊',
    coverUrl: 'https://images.unsplash.com/photo-1546561892-65bf811416b9?auto=format&fit=crop&q=80&w=600',
    authorId: mockUsers['u_1003'].id,
    authorName: mockUsers['u_1003'].nickname,
    authorAvatar: mockUsers['u_1003'].avatarUrl,
    likeCount: 5670,
    commentCount: 892,
    isLiked: false,
    tags: ['明日方舟', '正片', '琴柳', 'Cosplay'],
    createTime: '2024-03-18T12:30:00Z'
  }
]
