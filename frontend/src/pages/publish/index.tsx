import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { PrimaryButton } from '../../components/base/Button'
import './index.scss'

export default function Publish() {
  return (
    <View className="page-publish page-container">
      <View className="publish-grid">
        <View className="publish-card" onClick={() => Taro.navigateTo({ url: '/pages/publish-post/index' })}>
          <Text className="publish-card__title">发布作品 / 日常</Text>
          <PrimaryButton>进入</PrimaryButton>
        </View>
        <View className="publish-card" onClick={() => Taro.navigateTo({ url: '/pages/publish-demand/index' })}>
          <Text className="publish-card__title">发布合作需求</Text>
          <PrimaryButton>进入</PrimaryButton>
        </View>
      </View>
    </View>
  )
}
