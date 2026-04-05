import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import './index.scss'

export interface QuickEntryItem {
  id: string | number
  title: string
  icon: string
  url?: string
}

export interface QuickEntryGridProps {
  items: QuickEntryItem[]
  onItemClick?: (item: QuickEntryItem) => void
  className?: string
}

export function QuickEntryGrid({
  items,
  onItemClick,
  className
}: QuickEntryGridProps) {
  return (
    <View className={classNames('business-quick-entry', className)}>
      {items.map((item) => (
        <View 
          key={item.id} 
          className="business-quick-entry__item"
          onClick={() => onItemClick?.(item)}
        >
          <View className="business-quick-entry__icon-wrap">
            <Text className="business-quick-entry__icon-text">{item.icon}</Text>
          </View>
          <Text className="business-quick-entry__title">{item.title}</Text>
        </View>
      ))}
    </View>
  )
}
