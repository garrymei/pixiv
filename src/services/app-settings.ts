import Taro from '@tarojs/taro'
import { get, isMockMode, mockResponse } from './request'

type AppSettingsResponse = {
  publish_enabled?: boolean
}

const SETTINGS_CACHE_KEY = 'app_settings_cache'

let settingsPromise: Promise<AppSettingsResponse> | null = null

function normalizeSettings(data?: AppSettingsResponse) {
  return {
    publishEnabled: data?.publish_enabled === true
  }
}

function readCachedSettings() {
  try {
    const cached = Taro.getStorageSync(SETTINGS_CACHE_KEY) as AppSettingsResponse | ''
    return normalizeSettings(cached || undefined)
  } catch {
    return { publishEnabled: false }
  }
}

function writeCachedSettings(data: AppSettingsResponse) {
  try {
    Taro.setStorageSync(SETTINGS_CACHE_KEY, data)
  } catch {
    // Ignore cache write failure and continue with runtime value.
  }
}

export async function getAppSettings(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = readCachedSettings()
    if (cached.publishEnabled) return cached
  }

  if (settingsPromise && !forceRefresh) {
    const data = await settingsPromise
    return normalizeSettings(data)
  }

  settingsPromise = (async () => {
    if (isMockMode()) {
      const data = await mockResponse<AppSettingsResponse>({ publish_enabled: false })
      writeCachedSettings(data)
      return data
    }
    const data = await get<AppSettingsResponse>('/app-settings')
    writeCachedSettings(data)
    return data
  })()

  try {
    const data = await settingsPromise
    return normalizeSettings(data)
  } catch {
    const disabled = { publish_enabled: false }
    writeCachedSettings(disabled)
    return normalizeSettings(disabled)
  } finally {
    settingsPromise = null
  }
}

export async function guardPublishAccess(message = '当前版本暂未开放发布入口') {
  const settings = await getAppSettings(true)
  if (settings.publishEnabled) return true
  Taro.showToast({ title: message, icon: 'none' })
  return false
}

export async function redirectWhenPublishDisabled(message = '当前版本暂未开放发布入口') {
  const allowed = await guardPublishAccess(message)
  if (allowed) return true
  const pages = Taro.getCurrentPages()
  if (pages.length > 1) {
    Taro.navigateBack()
  } else {
    Taro.switchTab({ url: '/pages/home/index' })
  }
  return false
}
