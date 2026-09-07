import { useRef, useState } from 'react'
import { useDidHide, useDidShow } from '@tarojs/taro'
import { getAppSettings } from '../services/app-settings'

export function usePublishEnabled() {
  const [enabled, setEnabled] = useState(false)
  const generation = useRef(0)

  useDidShow(() => {
    const current = ++generation.current
    setEnabled(false)
    void getAppSettings(true).then((settings) => {
      if (generation.current === current) setEnabled(settings.publishEnabled)
    })
  })
  useDidHide(() => {
    generation.current += 1
    setEnabled(false)
  })

  return enabled
}
