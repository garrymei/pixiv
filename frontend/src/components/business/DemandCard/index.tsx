import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import { Tag } from '../../base/Tag'
import { Button } from '../../base/Button'
import { Avatar } from '../../base/Avatar'
import './index.scss'

export interface DemandCardProps {
  type: string // 如 'Coser', '摄影', '妆造'
  title: string
  budget?: string
  location?: string
  time?: string
  authorName: string
  authorAvatar?: string
  status?: 'open' | 'closed'
  onClick?: () => void
  onActionClick?: () => void
  className?: string
}

export function DemandCard({
  type,
  title,
  budget,
  location,
  time,
  authorName,
  authorAvatar,
  status = 'open',
  onClick,
  onActionClick,
  className
}: DemandCardProps) {
  const isClosed = status === 'closed'

  return (
    <View 
      className={classNames('business-demand-card', { 'business-demand-card--closed': isClosed }, className)}
      onClick={onClick}
    >
      <View className="business-demand-card__header">
        <View className="business-demand-card__author">
          <Avatar src={authorAvatar} size={40} className="business-demand-card__avatar" />
          <View className="business-demand-card__author-info">
            <Text className="business-demand-card__author-name">{authorName}</Text>
            <Text className="business-demand-card__time-post">刚刚发布</Text>
          </View>
        </View>
        <Tag type={isClosed ? 'default' : 'secondary'} outline={!isClosed}>
          {type}
        </Tag>
      </View>

      <View className="business-demand-card__body">
        <Text className="business-demand-card__title" numberOfLines={2}>{title}</Text>
        
        <View className="business-demand-card__meta-list">
          {time && (
            <View className="business-demand-card__meta-item">
              <View className="business-demand-card__icon-time" />
              <Text>{time}</Text>
            </View>
          )}
          {location && (
            <View className="business-demand-card__meta-item">
              <View className="business-demand-card__icon-location" />
              <Text>{location}</Text>
            </View>
          )}
        </View>
      </View>

      <View className="business-demand-card__footer">
        <View className="business-demand-card__budget">
          <Text className="business-demand-card__budget-label">预算：</Text>
          <Text className="business-demand-card__budget-value">{budget || '面议'}</Text>
        </View>
        
        <Button 
          type={isClosed ? 'secondary' : 'primary'} 
          size="small"
          disabled={isClosed}
          onClick={(e) => {
            e.stopPropagation()
            onActionClick?.()
          }}
        >
          {isClosed ? '已结束' : '立即联系'}
        </Button>
      </View>
    </View>
  )
}