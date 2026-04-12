import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function PublishHub() {
  return (
    <View className="page-publish page-container">
      <View className="publish-grid">
        <View className="publish-card" onClick={() => Taro.navigateTo({ url: '/pages/publish-post/index' })}>
          <Text className="publish-card__title">发布作品 / 日常</Text>
          <Text className="publish-card__action">进入</Text>
        </View>
        <View className="publish-card" onClick={() => Taro.navigateTo({ url: '/pages/publish-demand/index' })}>
          <Text className="publish-card__title">发布合作需求</Text>
          <Text className="publish-card__action">进入</Text>
        </View>
      </View>
    </View>
  )
}
