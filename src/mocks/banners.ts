import homeHeroImage from '../assets/home/home-hero.jpg'

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
    title: '',
    subtitle: '',
    imageUrl: homeHeroImage,
    linkUrl: '/pages/event-detail/index?id=e_1'
  },
  {
    id: 'b_2',
    title: '寻找最美 Coser',
    subtitle: '万元奖金池等你来拿',
    imageUrl: 'https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&q=80&w=1000',
    linkUrl: '/pages/discover/index'
  }
]
