import { View } from '@tarojs/components'
import classNames from 'classnames'
import './index.scss'

export interface TagProps {
  type?: 'primary' | 'secondary' | 'tertiary' | 'warning' | 'error' | 'success' | 'default'
  size?: 'small' | 'medium'
  outline?: boolean
  className?: string
  children: React.ReactNode
}

export function Tag({
  type = 'default',
  size = 'small',
  outline = false,
  className,
  children
}: TagProps) {
  return (
    <View
      className={classNames(
        'base-tag',
        `base-tag--${type}`,
        `base-tag--${size}`,
        {
          'base-tag--outline': outline
        },
        className
      )}
    >
      <View className="base-tag__content">{children}</View>
    </View>
  )
}