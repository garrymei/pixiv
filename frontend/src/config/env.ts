export type ApiMode = 'mock' | 'real'
export type RuntimeEnv = 'local' | 'test'

type EnvConfig = {
  apiBaseUrl: string
  uploadBaseUrl: string
}

function normalize(url?: string) {
  return (url || '').replace(/\/$/, '')
}

const envMap: Record<RuntimeEnv, EnvConfig> = {
  local: {
    apiBaseUrl: normalize(process.env.LOCAL_API_BASE_URL),
    uploadBaseUrl: normalize(process.env.LOCAL_UPLOAD_BASE_URL || process.env.LOCAL_API_BASE_URL)
  },
  test: {
    apiBaseUrl: normalize(process.env.TEST_API_BASE_URL),
    uploadBaseUrl: normalize(process.env.TEST_UPLOAD_BASE_URL || process.env.TEST_API_BASE_URL)
  }
}

export const defaultApiMode: ApiMode = (process.env.API_MODE as ApiMode) || 'mock'
export const defaultRuntimeEnv: RuntimeEnv = (process.env.APP_ENV as RuntimeEnv) || 'local'

export function getEnvConfig(env: RuntimeEnv) {
  return envMap[env] || envMap.local
}
