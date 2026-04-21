import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useMemo, useState } from 'react'
import classNames from 'classnames'

import { Input } from '../../components/base/Input'
import { loginByMockId, isMockMode, setSessionUser } from '../../services/request'
import { useThemeMode } from '../../config/theme'

import './index.scss'

const MOCK_ACCOUNTS = [
  { id: 'dev', name: '次元游客', icon: '👤', desc: '浏览与围观' },
  { id: 'u_1002', name: 'Coser', icon: '✨', desc: '角色与正片' },
  { id: 'u_1003', name: '摄影师', icon: '📷', desc: '返图与接单' }
]

export default function Login() {
  const [mockId, setMockId] = useState('dev')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { theme } = useThemeMode()

  const mockMode = useMemo(() => isMockMode(), [])

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      if (mockMode) {
        const defaultNickname = mockId === 'u_1002' ? 'Coser_小樱' : mockId === 'u_1003' ? '摄影老法师' : '粤次元君_官方'
        setSessionUser({
          id: mockId === 'u_1002' ? 1002 : mockId === 'u_1003' ? 1003 : 1,
          nickname: nickname.trim() || defaultNickname,
          role_type: 'user'
        })
      } else {
        await loginByMockId(mockId, nickname.trim() || undefined)
      }

      Taro.showToast({ title: '次元连接成功', icon: 'success' })
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/home/index' })
      }, 600)
    } catch (err: any) {
      setError(err?.message || '连接失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    Taro.switchTab({ url: '/pages/home/index' })
  }

  return (
    <View className={classNames('page-login', `theme-${theme}`)}>
      <View className="page-login__hero">
        <View className="page-login__status">
          <View className="page-login__status-dot anim-pulse-secondary" />
          <Text className="page-login__status-text">System Online / 湾区枢纽</Text>
        </View>
        <Text className="page-login__title anim-text-glow">粤次元君</Text>
        <Text className="page-login__subtitle">选择你的身份职阶，接入粤次元君的创作网络。</Text>
      </View>

      <View className="page-login__panel">
        <View className="page-login__section">
          <Text className="page-login__section-title">CHOOSE CLASS // 选择职阶</Text>
          <View className="page-login__class-grid">
            {MOCK_ACCOUNTS.map(acc => (
              <View
                key={acc.id}
                className={classNames('page-login__class-card', {
                  'page-login__class-card--active': mockId === acc.id
                })}
                onClick={() => setMockId(acc.id)}
              >
                <View className="page-login__class-icon">{acc.icon}</View>
                <View className="page-login__class-info">
                  <Text className="page-login__class-name">{acc.name}</Text>
                  <Text className="page-login__class-desc">{acc.desc}</Text>
                </View>
                {mockId === acc.id && <View className="page-login__class-corner" />}
              </View>
            ))}
          </View>
        </View>

        <View className="page-login__section">
          <Text className="page-login__section-title">CODENAME // 设定代号</Text>
          <Input
            value={nickname}
            onInput={e => setNickname((e.detail as any).value)}
            placeholder="输入本次行动的自定义昵称 (可选)"
            wrapperClass="page-login__input-wrap"
          />
        </View>

        {error && <Text className="page-login__error">{error}</Text>}

        <View className="page-login__actions">
          <View 
            className={classNames('page-login__btn-start', { 'page-login__btn-start--loading': loading })}
            onClick={handleLogin}
          >
            <Text className="page-login__btn-text">{loading ? 'CONNECTING...' : '建立连接'}</Text>
            <View className="page-login__btn-scan" />
          </View>

          <View className="page-login__skip" onClick={handleSkip}>
            <Text>直接进入以游客身份浏览 {'>'}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
