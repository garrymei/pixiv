import { mockUsers } from './user'

export interface Demand {
  id: string
  type: string
  title: string
  content?: string
  budget?: string
  location?: string
  time?: string
  authorId: string
  authorName: string
  authorAvatar?: string
  status: 'open' | 'closed'
  createTime: string
}

export const mockDemands: Demand[] = [
  {
    id: 'd_1',
    type: '摄影',
    title: '求一个周末有空的摄影师，拍原神申鹤外景，包车马费和午餐',
    budget: '300-500元',
    location: '广州市海珠区',
    time: '本周六下午',
    authorId: mockUsers['u_1002'].id,
    authorName: mockUsers['u_1002'].nickname,
    authorAvatar: mockUsers['u_1002'].avatarUrl,
    status: 'open',
    createTime: '2024-03-24T08:00:00Z'
  },
  {
    id: 'd_2',
    type: '妆娘',
    title: '五一漫展急求妆娘！三个角色连妆，可接单的请私聊，带价来',
    budget: '面议',
    location: '琶洲保利世贸',
    time: '5月1日 早上7点',
    authorId: mockUsers['u_1003'].id,
    authorName: mockUsers['u_1003'].nickname,
    authorAvatar: mockUsers['u_1003'].avatarUrl,
    status: 'open',
    createTime: '2024-03-23T14:20:00Z'
  },
  {
    id: 'd_3',
    type: 'Coser',
    title: '寻找能出《葬送的芙莉莲》修塔尔克的男Coser，已有芙莉莲和菲伦',
    budget: '无偿互勉',
    location: '深圳市天河区',
    time: '下个月中旬',
    authorId: 'u_1005',
    authorName: '社团团长',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Team',
    status: 'closed',
    createTime: '2024-03-20T10:00:00Z'
  },
  {
    id: 'd_4',
    type: '后期',
    title: '求一个修图大手子，赛博朋克风特效修图，9张连拼，急求',
    budget: '定价: 200元',
    location: '线上',
    time: '接单后3天内',
    authorId: mockUsers['u_1002'].id,
    authorName: mockUsers['u_1002'].nickname,
    authorAvatar: mockUsers['u_1002'].avatarUrl,
    status: 'open',
    createTime: '2024-03-25T12:00:00Z'
  },
  {
    id: 'd_5',
    type: '毛娘',
    title: '找一位毛娘帮忙修整和接驳初音的假发，需要带发网',
    budget: '50-100元',
    location: '广州市番禺区',
    time: '本周末',
    authorId: 'u_1004',
    authorName: '手工大佬',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Craft',
    status: 'open',
    createTime: '2024-03-25T09:30:00Z'
  }
]