import { View, Image, Text } from '@tarojs/components'
import classNames from 'classnames'
import { Button } from '../../base/Button'
import { Tag } from '../../base/Tag'
import './index.scss'

export interface EventCardProps {
  coverUrl: string
  title: string
  time: string
  location: string
  status: 'upcoming' | 'ongoing' | 'ended'
  price?: string
  capacity?: string
  deadline?: string
  actionText?: string
  onClick?: () => void
  onActionClick?: () => void
  className?: string
}

export function EventCard({
  coverUrl,
  title,
  time,
  location,
  status,
  price,
  capacity,
  deadline,
  actionText,
  onClick,
  onActionClick,
  className
}: EventCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'ongoing':
        return { text: '进行中', type: 'primary' as const, outline: false }
      case 'upcoming':
        return { text: '即将开始', type: 'warning' as const, outline: true }
      case 'ended':
        return { text: '已结束', type: 'default' as const, outline: true }
      default:
        return { text: '未知', type: 'default' as const, outline: true }
    }
  }

  const statusConfig = getStatusConfig()
  const isEnded = status === 'ended'

  return (
    <View 
      className={classNames('business-event-card', { 'business-event-card--ended': isEnded }, className)}
      onClick={onClick}
    >
      <View className="business-event-card__cover-wrap">
        <Image className="business-event-card__cover" src={coverUrl} mode="aspectFill" />
        <View className="business-event-card__status">
          <Tag type={statusConfig.type} outline={statusConfig.outline}>
            {statusConfig.text}
          </Tag>
        </View>
      </View>

      <View className="business-event-card__info">
        <Text className="business-event-card__title" numberOfLines={2}>{title}</Text>
        
        <View className="business-event-card__meta">
          <View className="business-event-card__meta-item">
            <View className="business-event-card__icon-time" />
            <Text>{time}</Text>
          </View>
          <View className="business-event-card__meta-item">
            <View className="business-event-card__icon-location" />
            <Text>{location}</Text>
          </View>
          {capacity && (
            <View className="business-event-card__meta-item">
              <Text>{capacity}</Text>
            </View>
          )}
          {deadline && (
            <View className="business-event-card__meta-item">
              <Text>{deadline}</Text>
            </View>
          )}
        </View>

        <View className="business-event-card__footer">
          <Text className="business-event-card__price">{price || '免费'}</Text>
          <Button 
            type={isEnded ? 'secondary' : 'primary'} 
            size="small"
            disabled={isEnded}
            onClick={(e) => {
              e.stopPropagation()
              onActionClick?.()
            }}
          >
            {actionText || (isEnded ? '已结束' : '立即报名')}
          </Button>
        </View>
      </View>
    </View>
  )
}
