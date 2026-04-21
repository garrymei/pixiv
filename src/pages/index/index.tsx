import { View, Text } from '@tarojs/components'
import { useThemeMode } from '../../config/theme'
import './index.scss'

export default function Page() {
  const { theme } = useThemeMode()
  return (
    <View className={`page-container theme-${theme}`}>
      <Text>首页</Text>
    </View>
  )
}
