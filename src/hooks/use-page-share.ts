import { useShareAppMessage, useShareTimeline } from '@tarojs/taro'

type PageShareOptions = {
  title: string
  path: string
  imageUrl?: string
}

export function usePageShare({ title, path, imageUrl }: PageShareOptions) {
  useShareAppMessage(() => ({ title, path, imageUrl }))
  useShareTimeline(() => ({
    title,
    query: path.includes('?') ? path.split('?').slice(1).join('?') : '',
    imageUrl
  }))
}
