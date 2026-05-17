import { View, Text } from '@tarojs/components'
import classNames from 'classnames'

import { Tag } from '../../components/base/Tag'
import { useThemeMode, type ThemeMode } from '../../config/theme'

import './index.scss'

const THEME_OPTIONS: Array<{ id: ThemeMode; label: string; description: string }> = [
  { id: 'dark', label: '深色', description: '适合夜间浏览，保留当前赛博风格。' },
  { id: 'light', label: '浅色', description: '适合白天浏览，阅读更轻盈。' }
]

export default function Settings() {
  const { theme, setTheme } = useThemeMode()

  return (
    <View className={classNames('page-settings', `theme-${theme}`)}>
      <View className="page-settings__section">
        <Text className="page-settings__title">显示设置</Text>
        <Text className="page-settings__desc">主题颜色切换已统一放到设置中管理。</Text>
      </View>

      <View className="page-settings__card">
        <View className="page-settings__row-head">
          <Text className="page-settings__row-title">界面主题</Text>
          <Tag type="secondary" size="medium">{theme === 'light' ? '浅色模式' : '深色模式'}</Tag>
        </View>

        <View className="page-settings__options">
          {THEME_OPTIONS.map((option) => (
            <View
              key={option.id}
              className={classNames('page-settings__option', {
                'page-settings__option--active': theme === option.id
              })}
              onClick={() => setTheme(option.id)}
            >
              <View className="page-settings__option-main">
                <Text className="page-settings__option-title">{option.label}</Text>
                <Text className="page-settings__option-desc">{option.description}</Text>
              </View>
              <Text className="page-settings__option-check">{theme === option.id ? '已启用' : '点击切换'}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
