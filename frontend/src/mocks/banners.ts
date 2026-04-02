export interface Banner {
  id: string
  title: string
  subtitle?: string
  imageUrl: string
  linkUrl?: string
}

export const mockBanners: Banner[] = [
  {
    id: 'b_1',
    title: '广州 YACA 动漫展 2024',
    subtitle: '年度最大同人盛会即将开幕！',
    imageUrl: 'https://images.unsplash.com/photo-1612487528505-d2338264c821?auto=format&fit=crop&q=80&w=1000',
    linkUrl: '/pages/event-detail/index?id=e_1'
  },
  {
    id: 'b_2',
    title: '寻找最美 Coser',
    subtitle: '万元奖金池等你来拿',
    imageUrl: 'https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&q=80&w=1000',
    linkUrl: '/pages/explore/index'
  }
]