import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { guardPublishAccess, redirectWhenPublishDisabled } from '../../services/app-settings'
import { useThemeMode } from '../../config/theme'
import './index.scss'

export default function Publish() {
  const [accessAllowed, setAccessAllowed] = useState(false)
  const { theme } = useThemeMode()

  useDidShow(() => {
    setAccessAllowed(false)
    void redirectWhenPublishDisabled().then(setAccessAllowed)
  })

  const openPublishPage = async (url: string) => {
    if (!(await guardPublishAccess())) return
    Taro.navigateTo({ url })
  }

  if (!accessAllowed) return <View className={`page-publish page-container theme-${theme}`} />

  return (
    <View className={`page-publish page-container theme-${theme}`}>
      <View className="publish-grid">
        <View className="publish-card" onClick={() => openPublishPage('/pages/publish-post/index')}>
          <Text className="publish-card__title">发布作品 / 日常</Text>
          <Text className="publish-card__action">进入</Text>
        </View>
        <View className="publish-card" onClick={() => openPublishPage('/pages/publish-demand/index')}>
          <Text className="publish-card__title">发布合作需求</Text>
          <Text className="publish-card__action">进入</Text>
        </View>
      </View>
    </View>
  )
}
