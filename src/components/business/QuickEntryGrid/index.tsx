import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import './index.scss'

export type QuickEntryIconType = 'calendar' | 'handshake'

export interface QuickEntryItem {
  id: string | number
  title: string
  icon?: string
  iconType?: QuickEntryIconType
  url?: string
}

export interface QuickEntryGridProps {
  items: QuickEntryItem[]
  onItemClick?: (item: QuickEntryItem) => void
  className?: string
}

function QuickEntryIcon({ type, fallback }: { type?: QuickEntryIconType; fallback?: string }) {
  if (!type) return <Text className="business-quick-entry__icon-text">{fallback}</Text>
  return (
    <View className={classNames('business-quick-entry__icon', `business-quick-entry__icon--${type}`)}>
      <View className="business-quick-entry__icon-line business-quick-entry__icon-line--a" />
      <View className="business-quick-entry__icon-line business-quick-entry__icon-line--b" />
      <View className="business-quick-entry__icon-line business-quick-entry__icon-line--c" />
    </View>
  )
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
            <QuickEntryIcon type={item.iconType} fallback={item.icon} />
          </View>
          <Text className="business-quick-entry__title">{item.title}</Text>
        </View>
      ))}
    </View>
  )
}
