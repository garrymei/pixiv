import { View, Image, Text } from '@tarojs/components'
import classNames from 'classnames'
import { useState } from 'react'
import { Avatar } from '../../base/Avatar'
import './index.scss'

export interface PostCardProps {
  coverUrl?: string
  title: string
  authorName: string
  authorAvatar?: string
  likeCount?: number
  commentCount?: number
  tags?: string[]
  isWaterfall?: boolean // 是否为瀑布流布局模式
  onClick?: () => void
  className?: string
}

export function PostCard({
  coverUrl,
  title,
  authorName,
  authorAvatar,
  likeCount = 0,
  commentCount = 0,
  tags = [],
  isWaterfall = true,
  onClick,
  className
}: PostCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const shouldShowCover = !!coverUrl && !imageFailed

  return (
    <View 
      className={classNames(
        'business-post-card',
        { 'business-post-card--waterfall': isWaterfall },
        className
      )}
      onClick={onClick}
    >
      {shouldShowCover ? (
        <View className="business-post-card__cover-wrap">
          <Image 
            className="business-post-card__cover" 
            src={coverUrl} 
            mode="aspectFill" 
            onError={() => setImageFailed(true)}
          />
          {tags.length > 0 && (
            <View className="business-post-card__tags">
              {tags.slice(0, 2).map((tag, idx) => (
                <View key={idx} className="business-post-card__tag-item"><Text>{tag}</Text></View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View className="business-post-card__cover-placeholder">
          <Text>{coverUrl ? '图片加载失败' : '暂无图片'}</Text>
        </View>
      )}

      <View className="business-post-card__info">
        <Text className="business-post-card__title" numberOfLines={2}>{title}</Text>
        
        <View className="business-post-card__footer">
          <View className="business-post-card__author">
            <Avatar src={authorAvatar} size={32} className="business-post-card__avatar" />
            <Text className="business-post-card__author-name" numberOfLines={1}>{authorName}</Text>
          </View>
          
          <View className="business-post-card__stats">
            <View className="business-post-card__stat-item">
              <View className="business-post-card__icon-like" />
              <Text>{likeCount}</Text>
            </View>
            {/* 瀑布流下通常只展示点赞，常规列表展示评论 */}
            {!isWaterfall && (
              <View className="business-post-card__stat-item">
                <View className="business-post-card__icon-comment" />
                <Text>{commentCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}
