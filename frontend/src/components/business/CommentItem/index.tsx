import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import { Avatar } from '../../base/Avatar'
import './index.scss'

export interface CommentItemProps {
  authorName: string
  authorAvatar?: string
  content: string
  time: string
  likeCount?: number
  isLiked?: boolean
  replyCount?: number
  onLike?: () => void
  onReply?: () => void
  className?: string
}

export function CommentItem({
  authorName,
  authorAvatar,
  content,
  time,
  likeCount = 0,
  isLiked = false,
  replyCount = 0,
  onLike,
  onReply,
  className
}: CommentItemProps) {
  return (
    <View className={classNames('business-comment-item', className)}>
      <Avatar src={authorAvatar} size={64} className="business-comment-item__avatar" />
      
      <View className="business-comment-item__main">
        <View className="business-comment-item__header">
          <Text className="business-comment-item__author">{authorName}</Text>
          <View 
            className="business-comment-item__like-wrap"
            onClick={onLike}
          >
            <View 
              className={classNames(
                'business-comment-item__icon-like', 
                { 'business-comment-item__icon-like--active': isLiked }
              )} 
            />
            {likeCount > 0 && (
              <Text className={classNames(
                'business-comment-item__like-count',
                { 'business-comment-item__like-count--active': isLiked }
              )}>
                {likeCount}
              </Text>
            )}
          </View>
        </View>

        <Text className="business-comment-item__content">{content}</Text>

        <View className="business-comment-item__footer">
          <Text className="business-comment-item__time">{time}</Text>
          <Text 
            className="business-comment-item__reply-btn"
            onClick={onReply}
          >
            回复 {replyCount > 0 ? `(${replyCount})` : ''}
          </Text>
        </View>
      </View>
    </View>
  )
}