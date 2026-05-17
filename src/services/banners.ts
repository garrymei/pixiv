import { get, isMockMode, mockResponse } from './request'
import { mockBanners } from '../mocks/banners'

type BannerRecord = {
  id: number
  title?: string
  subtitle?: string
  image_url: string
  link_url?: string
}

export async function listBanners(position = 'home_top') {
  if (!isMockMode()) {
    const query = position ? `?position=${encodeURIComponent(position)}` : ''
    const data = await get<{ list: BannerRecord[] }>(`/banners${query}`)
    return (data.list || []).map((item) => ({
      id: `b_${item.id}`,
      title: item.title || '',
      subtitle: item.subtitle || '',
      imageUrl: item.image_url,
      linkUrl: item.link_url || ''
    }))
  }
  if (position === 'login_poster') {
    return mockResponse(mockBanners.slice(0, 1))
  }
  return mockResponse(mockBanners)
}
