import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import './index.scss'

export interface SectionHeaderProps {
  title: string
  actionText?: string
  onAction?: () => void
  className?: string
}

export function SectionHeader({
  title,
  actionText,
  onAction,
  className
}: SectionHeaderProps) {
  return (
    <View className={classNames('base-section-header', className)}>
      <Text className="base-section-header__title">{title}</Text>
      {actionText && (
        <View className="base-section-header__action" onClick={onAction}>
          <Text>{actionText}</Text>
          <View className="base-section-header__icon" />
        </View>
      )}
    </View>
  )
}