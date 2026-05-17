import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { isGuestMode, promptLogin } from '../../services/request'
import { useThemeMode } from '../../config/theme'
import './index.scss'

export default function PublishHub() {
  const { theme } = useThemeMode()
  const handleOpen = (url: string) => {
    if (isGuestMode()) {
      promptLogin('游客模式下不能发布内容')
      return
    }
    Taro.navigateTo({ url })
  }

  return (
    <View className={`page-publish page-container theme-${theme}`}>
      <View className="publish-grid">
        <View className="publish-card" onClick={() => handleOpen('/pages/publish-post/index')}>
          <Text className="publish-card__title">发布作品 / 日常</Text>
          <Text className="publish-card__action">进入</Text>
        </View>
        <View className="publish-card" onClick={() => handleOpen('/pages/publish-demand/index')}>
          <Text className="publish-card__title">发布合作需求</Text>
          <Text className="publish-card__action">进入</Text>
        </View>
      </View>
    </View>
  )
}
