import { View } from '@tarojs/components'
import classNames from 'classnames'
import './index.scss'

export interface ButtonProps {
  type?: 'primary' | 'secondary' | 'outline' | 'text'
  size?: 'large' | 'medium' | 'small'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  className?: string
  onClick?: (e: any) => void
  children?: React.ReactNode
}

export function Button({
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  block = false,
  className,
  onClick,
  children
}: ButtonProps) {
  const handleClick = (e: any) => {
    if (disabled || loading) return
    onClick?.(e)
  }

  return (
    <View
      className={classNames(
        'base-button',
        `base-button--${type}`,
        `base-button--${size}`,
        {
          'base-button--disabled': disabled,
          'base-button--loading': loading,
          'base-button--block': block
        },
        className
      )}
      onClick={handleClick}
    >
      {loading && <View className="base-button__loading-icon" />}
      <View className="base-button__content">{children}</View>
    </View>
  )
}

// 快捷组件导出
export const PrimaryButton = (props: Omit<ButtonProps, 'type'>) => <Button type="primary" {...props} />
export const SecondaryButton = (props: Omit<ButtonProps, 'type'>) => <Button type="secondary" {...props} />
