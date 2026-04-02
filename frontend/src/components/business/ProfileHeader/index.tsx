import { View, Image, Text } from '@tarojs/components'
import classNames from 'classnames'
import { Avatar } from '../../base/Avatar'
import { Button } from '../../base/Button'
import './index.scss'

export interface ProfileHeaderProps {
  nickname: string
  avatar?: string
  bio?: string
  bgUrl?: string
  isSelf?: boolean
  isFollowing?: boolean
  followersCount?: number
  followingCount?: number
  onEditClick?: () => void
  onFollowClick?: () => void
  className?: string
}

export function ProfileHeader({
  nickname,
  avatar,
  bio,
  bgUrl,
  isSelf = false,
  isFollowing = false,
  followersCount = 0,
  followingCount = 0,
  onEditClick,
  onFollowClick,
  className
}: ProfileHeaderProps) {
  return (
    <View className={classNames('business-profile-header', className)}>
      <View className="business-profile-header__bg-wrap">
        {bgUrl ? (
          <Image className="business-profile-header__bg" src={bgUrl} mode="aspectFill" />
        ) : (
          <View className="business-profile-header__bg-placeholder" />
        )}
        <View className="business-profile-header__overlay" />
      </View>

      <View className="business-profile-header__content">
        <View className="business-profile-header__top">
          <Avatar src={avatar} size={160} className="business-profile-header__avatar" />
          <View className="business-profile-header__action">
            {isSelf ? (
              <Button type="outline" size="small" onClick={onEditClick}>编辑资料</Button>
            ) : (
              <Button 
                type={isFollowing ? 'secondary' : 'primary'} 
                size="small" 
                onClick={onFollowClick}
              >
                {isFollowing ? '已关注' : '关注'}
              </Button>
            )}
          </View>
        </View>

        <Text className="business-profile-header__name">{nickname}</Text>
        
        <Text className="business-profile-header__bio">
          {bio || '这个人很懒，什么都没写~'}
        </Text>

        <View className="business-profile-header__stats">
          <View className="business-profile-header__stat-item">
            <Text className="business-profile-header__stat-num">{followingCount}</Text>
            <Text className="business-profile-header__stat-label">关注</Text>
          </View>
          <View className="business-profile-header__stat-item">
            <Text className="business-profile-header__stat-num">{followersCount}</Text>
            <Text className="business-profile-header__stat-label">粉丝</Text>
          </View>
        </View>
      </View>
    </View>
  )
}