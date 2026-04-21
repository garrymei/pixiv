import Taro, { useDidShow } from '@tarojs/taro'
import { useCallback, useState } from 'react'

export type ThemeMode = 'dark' | 'light'

const THEME_KEY = 'ui_theme_mode'

export function getThemeMode(): ThemeMode {
  const stored = Taro.getStorageSync(THEME_KEY) as ThemeMode | ''
  return stored === 'light' ? 'light' : 'dark'
}

export function setThemeMode(mode: ThemeMode) {
  const next: ThemeMode = mode === 'light' ? 'light' : 'dark'
  Taro.setStorageSync(THEME_KEY, next)
  applyNativeTheme(next)
  return next
}

export function toggleThemeMode() {
  const next = getThemeMode() === 'light' ? 'dark' : 'light'
  return setThemeMode(next)
}

function applyNativeTheme(mode: ThemeMode) {
  try {
    const backgroundColor = mode === 'light' ? '#f7f7fb' : '#0d0a15'
    const frontColor = mode === 'light' ? '#000000' : '#ffffff'
    Taro.setNavigationBarColor({ backgroundColor, frontColor, animation: { duration: 180, timingFunc: 'easeIn' } })
    Taro.setBackgroundColor({ backgroundColor })
    Taro.setBackgroundTextStyle({ textStyle: mode === 'light' ? 'dark' : 'light' })
  } catch (_) {}
}

export function useThemeMode() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const current = getThemeMode()
    applyNativeTheme(current)
    return current
  })

  useDidShow(() => {
    setTheme(getThemeMode())
  })

  const updateTheme = useCallback((mode: ThemeMode) => {
    setTheme(setThemeMode(mode))
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(toggleThemeMode())
  }, [])

  return { theme, setTheme: updateTheme, toggleTheme }
}
