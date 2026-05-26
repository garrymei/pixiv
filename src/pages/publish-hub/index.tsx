import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { isGuestMode, promptLogin } from '../../services/request'
import { useThemeMode } from '../../config/theme'
import './index.scss'

const PUBLISH_ENTRIES = [
  {
    id: 'post',
    title: '发布作品 / 日常',
    desc: '分享出片、逛展记录、同好动态',
    icon: '图',
    action: '去发布',
    url: '/pages/publish-post/index'
  },
  {
    id: 'demand',
    title: '发布合作需求',
    desc: '寻找摄影、妆娘、毛娘或其他协作',
    icon: '约',
    action: '发需求',
    url: '/pages/publish-demand/index'
  }
]

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
      <View className="publish-hero">
        <Text className="publish-hero__eyebrow">PUBLISH</Text>
        <Text className="publish-hero__title">今天想发布什么？</Text>
        <Text className="publish-hero__desc">选择内容类型，后续信息会按场景收口。</Text>
      </View>

      <View className="publish-grid">
        {PUBLISH_ENTRIES.map((entry) => (
          <View key={entry.id} className="publish-card" onClick={() => handleOpen(entry.url)}>
            <View className="publish-card__icon">{entry.icon}</View>
            <View className="publish-card__body">
              <Text className="publish-card__title">{entry.title}</Text>
              <Text className="publish-card__desc">{entry.desc}</Text>
            </View>
            <Text className="publish-card__action">{entry.action}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
