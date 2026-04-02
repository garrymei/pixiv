import { View, Image } from '@tarojs/components'
import classNames from 'classnames'
import './index.scss'

export interface AvatarProps {
  src?: string
  size?: 'large' | 'medium' | 'small' | number
  className?: string
  onClick?: () => void
}

export function Avatar({
  src,
  size = 'medium',
  className,
  onClick
}: AvatarProps) {
  const customStyle = typeof size === 'number' ? {
    width: `${size}rpx`,
    height: `${size}rpx`
  } : {}

  return (
    <View 
      className={classNames(
        'base-avatar',
        typeof size === 'string' ? `base-avatar--${size}` : '',
        className
      )}
      style={customStyle}
      onClick={onClick}
    >
      {src ? (
        <Image className="base-avatar__image" src={src} mode="aspectFill" />
      ) : (
        <View className="base-avatar__fallback" />
      )}
    </View>
  )
}