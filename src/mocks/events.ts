export interface Event {
  id: string
  title: string
  coverUrl: string
  time: string
  location: string
  status: 'upcoming' | 'ongoing' | 'ended'
  price?: string
  organizer: string
}

export const mockEvents: Event[] = [
  {
    id: 'e_1',
    title: '第28届 YACA 动漫展 - 盛夏狂欢季',
    coverUrl: 'https://images.unsplash.com/photo-1612487528505-d2338264c821?auto=format&fit=crop&q=80&w=800',
    time: '2024.08.15 - 08.17',
    location: '广州保利世贸博览馆',
    status: 'upcoming',
    price: '¥ 68起',
    organizer: 'YACA 组委会'
  },
  {
    id: 'e_2',
    title: '【官方举办】周末二次元同好面基会（包含摄影交流、Coser游园）',
    coverUrl: 'https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&q=80&w=800',
    time: '2024.04.10 14:00',
    location: '广州市天河区动漫星城',
    status: 'ongoing',
    price: '免费',
    organizer: '粤次元君_官方'
  },
  {
    id: 'e_3',
    title: '初音未来 15周年 纪念全息演唱会 - 广州站',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
    time: '2023.12.24 19:30',
    location: '广州体育馆',
    status: 'ended',
    price: '¥ 280起',
    organizer: '某演出公司'
  }
]