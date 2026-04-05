import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import './index.scss'

export interface CountBadgeProps {
  count: number
  max?: number
  showZero?: boolean
  className?: string
}

export function CountBadge({
  count,
  max = 99,
  showZero = false,
  className
}: CountBadgeProps) {
  if (count <= 0 && !showZero) return null

  const displayCount = count > max ? `${max}+` : count

  return (
    <View className={classNames('base-count-badge', className)}>
      <Text className="base-count-badge__text">{displayCount}</Text>
    </View>
  )
}