import { Input as TaroInput, View, Text } from '@tarojs/components'
import type { InputProps as TaroInputProps } from '@tarojs/components'
import classNames from 'classnames'
import './index.scss'

export interface InputProps extends Omit<TaroInputProps, 'className'> {
  label?: string
  error?: string
  className?: string
  wrapperClass?: string
}

export function Input({
  label,
  error,
  className,
  wrapperClass,
  placeholderTextColor = '#757575',
  ...rest
}: InputProps) {
  return (
    <View className={classNames('base-input-wrapper', wrapperClass)}>
      {label && <Text className="base-input__label">{label}</Text>}
      
      <View
        className={classNames('base-input__container', {
          'base-input__container--error': !!error,
          'base-input__container--disabled': rest.disabled
        })}
      >
        <TaroInput
          className={classNames('base-input__control', className)}
          placeholderTextColor={placeholderTextColor}
          {...rest}
        />
      </View>
      
      {error && <Text className="base-input__error">{error}</Text>}
    </View>
  )
}