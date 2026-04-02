import { mockResponse } from './request'
import { mockBanners } from '../mocks/banners'

export async function listBanners() {
  return mockResponse(mockBanners)
}
