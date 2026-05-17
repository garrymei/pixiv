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
  createTime?: string
  authorName: string
  authorAvatar?: string
  status?: 'open' | 'closed'
  statusText?: string
  actionText?: string
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
  createTime,
  authorName,
  authorAvatar,
  status = 'open',
  statusText,
  actionText,
  onClick,
  onActionClick,
  className
}: DemandCardProps) {
  const isClosed = status === 'closed'
  const resolvedStatusText = statusText || (isClosed ? '已关闭' : '招募中')
  const resolvedActionText = actionText || (isClosed ? '查看状态' : '查看详情')

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
            <Text className="business-demand-card__time-post">{createTime || '刚刚发布'}</Text>
          </View>
        </View>
        <Tag type={isClosed ? 'default' : 'secondary'} outline={!isClosed}>
          {type}
        </Tag>
      </View>

      <View className="business-demand-card__body">
        <Text className="business-demand-card__title" numberOfLines={2}>{title}</Text>

        <View className="business-demand-card__status-row">
          <Text className={classNames('business-demand-card__status-text', {
            'business-demand-card__status-text--closed': isClosed
          })}>
            状态：{resolvedStatusText}
          </Text>
        </View>
        
        <View className="business-demand-card__meta-list">
          {time && (
            <View className="business-demand-card__meta-item">
              <View className="business-demand-card__icon-time" />
              <Text>预约时间：{time}</Text>
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
          onClick={(e) => {
            e.stopPropagation()
            onActionClick?.()
          }}
        >
          {resolvedActionText}
        </Button>
      </View>
    </View>
  )
}
