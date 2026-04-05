import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import './index.scss'

export interface StatItem {
  id: string
  label: string
  value: number | string
  icon?: string
  onClick?: () => void
}

export interface StatShortcutGridProps {
  items: StatItem[]
  className?: string
}

export function StatShortcutGrid({
  items,
  className
}: StatShortcutGridProps) {
  return (
    <View className={classNames('business-stat-shortcut', className)}>
      {items.map((item) => (
        <View 
          key={item.id} 
          className="business-stat-shortcut__item"
          onClick={item.onClick}
        >
          <Text className="business-stat-shortcut__value">{item.value}</Text>
          <Text className="business-stat-shortcut__label">{item.label}</Text>
        </View>
      ))}
    </View>
  )
}