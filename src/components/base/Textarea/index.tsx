import { Textarea as TaroTextarea, View, Text } from '@tarojs/components'
import type { TextareaProps as TaroTextareaProps } from '@tarojs/components'
import classNames from 'classnames'
import './index.scss'

export interface TextareaProps extends Omit<TaroTextareaProps, 'className'> {
  label?: string
  error?: string
  showCount?: boolean
  className?: string
  wrapperClass?: string
}

export function Textarea({
  label,
  error,
  showCount,
  maxlength = 140,
  value = '',
  className,
  wrapperClass,
  placeholderClass = 'base-textarea__placeholder',
  ...rest
}: TextareaProps) {
  const currentLength = String(value).length

  return (
    <View className={classNames('base-textarea-wrapper', wrapperClass)}>
      {label && <Text className="base-textarea__label">{label}</Text>}
      
      <View
        className={classNames('base-textarea__container', {
          'base-textarea__container--error': !!error,
          'base-textarea__container--disabled': rest.disabled
        })}
      >
        <TaroTextarea
          className={classNames('base-textarea__control', className)}
          placeholderClass={placeholderClass}
          maxlength={maxlength}
          value={value}
          {...rest}
        />
        
        {showCount && (
          <View className="base-textarea__count">
            <Text className={classNames({ 'base-textarea__count--full': currentLength >= maxlength })}>
              {currentLength}
            </Text>
            /{maxlength}
          </View>
        )}
      </View>
      
      {error && <Text className="base-textarea__error">{error}</Text>}
    </View>
  )
}