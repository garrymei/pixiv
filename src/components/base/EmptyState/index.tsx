import { View, Image, Text } from '@tarojs/components'
import classNames from 'classnames'
import { Button } from '../Button'
import './index.scss'

export interface EmptyStateProps {
  image?: string
  title?: string
  description?: string
  actionText?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  image,
  title = '暂无数据',
  description,
  actionText,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <View className={classNames('base-empty-state', className)}>
      <View className="base-empty-state__image-wrapper">
        {image ? (
          <Image className="base-empty-state__image" src={image} mode="aspectFit" />
        ) : (
          <View className="base-empty-state__placeholder-icon" />
        )}
      </View>
      
      <Text className="base-empty-state__title">{title}</Text>
      
      {description && (
        <Text className="base-empty-state__desc">{description}</Text>
      )}
      
      {actionText && onAction && (
        <View className="base-empty-state__action">
          <Button type="primary" size="medium" onClick={onAction}>
            {actionText}
          </Button>
        </View>
      )}
    </View>
  )
}