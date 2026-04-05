import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useMemo, useState } from 'react'
import { Input } from '../../components/base/Input'
import { Button, PrimaryButton } from '../../components/base/Button'
import { loginByMockId, isMockMode, setSessionUser } from '../../services/request'
import './index.scss'

const ACCOUNT_OPTIONS = [
  { id: 'dev', label: '默认账号', desc: '适合联调与本地验证' },
  { id: 'u_1002', label: 'Coser 账号', desc: '适合查看内容创作视角' },
  { id: 'u_1003', label: '摄影师账号', desc: '适合查看协作与活动视角' }
]

export default function LoginPage() {
  const [mockId, setMockId] = useState('dev')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const mockMode = useMemo(() => isMockMode(), [])

  const submit = async () => {
    setError('')
    setLoading(true)
    try {
      if (mockMode) {
        const defaultNickname = mockId === 'u_1002' ? 'Coser_小樱' : mockId === 'u_1003' ? '摄影老法师' : '粤次元君_官方'
        setSessionUser({
          id: mockId === 'u_1002' ? 1002 : mockId === 'u_1003' ? 1003 : 1001,
          nickname: nickname.trim() || defaultNickname,
          role_type: 'user'
        })
      } else {
        await loginByMockId(mockId, nickname.trim() || undefined)
      }

      Taro.showToast({
        title: '登录成功',
        icon: 'success'
      })

      setTimeout(() => {
        Taro.switchTab({ url: '/pages/home/index' })
      }, 300)
    } catch (err: any) {
      setError(err?.message || '登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="page-login page-container-full">
      <View className="page-login__hero">
        <Text className="page-login__eyebrow">YUE CI YUAN JUN</Text>
        <Text className="page-login__title">欢迎回来</Text>
        <Text className="page-login__subtitle">先进入登录页建立会话，再继续浏览作品、报名活动和参与协作。</Text>
      </View>

      <View className="page-login__card">
        <View className="page-login__section">
          <Text className="page-login__section-title">选择账号</Text>
          <Text className="page-login__section-desc">CloudBase 或外部平台需要读取登录页时，可直接进入这里完成会话初始化。</Text>
        </View>

        <View className="page-login__account-list">
          {ACCOUNT_OPTIONS.map((item) => (
            <View
              key={item.id}
              className={`page-login__account-item ${mockId === item.id ? 'page-login__account-item--active' : ''}`}
              onClick={() => setMockId(item.id)}
            >
              <View className="page-login__account-main">
                <Text className="page-login__account-title">{item.label}</Text>
                <Text className="page-login__account-desc">{item.desc}</Text>
              </View>
              <View className="page-login__account-check">
                <Text>{mockId === item.id ? '已选' : '选择'}</Text>
              </View>
            </View>
          ))}
        </View>

        <Input
          label="昵称（可选）"
          value={nickname}
          onInput={(e) => setNickname((e.detail as any).value)}
          placeholder="自定义这次会话显示昵称"
        />

        {error ? <Text className="page-login__error">{error}</Text> : null}

        <PrimaryButton block loading={loading} className="page-login__submit" onClick={submit}>
          立即登录
        </PrimaryButton>

        <Button type="text" block className="page-login__skip" onClick={() => Taro.switchTab({ url: '/pages/home/index' })}>
          稍后再说，先去首页看看
        </Button>
      </View>
    </View>
  )
}
