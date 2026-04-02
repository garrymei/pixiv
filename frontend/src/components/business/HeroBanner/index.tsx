import { View, Image, Text } from '@tarojs/components'
import classNames from 'classnames'
import { Button } from '../../base/Button'
import './index.scss'

export interface HeroBannerProps {
  title: string
  subtitle?: string
  backgroundImage?: string
  ctaText?: string
  onCtaClick?: () => void
  onClick?: () => void
  className?: string
}

export function HeroBanner({
  title,
  subtitle,
  backgroundImage,
  ctaText,
  onCtaClick,
  onClick,
  className
}: HeroBannerProps) {
  return (
    <View 
      className={classNames('business-hero-banner', className)}
      onClick={onClick}
    >
      {backgroundImage && (
        <Image 
          className="business-hero-banner__bg" 
          src={backgroundImage} 
          mode="aspectFill" 
        />
      )}
      <View className="business-hero-banner__overlay" />
      
      <View className="business-hero-banner__content">
        <View className="business-hero-banner__text-wrap">
          <Text className="business-hero-banner__title">{title}</Text>
          {subtitle && (
            <Text className="business-hero-banner__subtitle">{subtitle}</Text>
          )}
        </View>
        
        {ctaText && onCtaClick && (
          <Button 
            type="primary" 
            size="small" 
            className="business-hero-banner__cta"
            onClick={(e) => {
              e.stopPropagation()
              onCtaClick()
            }}
          >
            {ctaText}
          </Button>
        )}
      </View>
    </View>
  )
}