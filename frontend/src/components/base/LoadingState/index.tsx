import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import './index.scss'

export interface LoadingStateProps {
  text?: string
  fullScreen?: boolean
  className?: string
}

export function LoadingState({
  text = '加载中...',
  fullScreen = false,
  className
}: LoadingStateProps) {
  return (
    <View
      className={classNames(
        'base-loading-state',
        {
          'base-loading-state--full': fullScreen
        },
        className
      )}
    >
      <View className="base-loading-state__spinner">
        <View className="base-loading-state__circle" />
        <View className="base-loading-state__circle" />
        <View className="base-loading-state__circle" />
      </View>
      {text && <Text className="base-loading-state__text">{text}</Text>}
    </View>
  )
}