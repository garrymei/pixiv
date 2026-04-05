import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCallback, useEffect, useState } from 'react'
import { Avatar } from '../../components/base/Avatar'
import { Input } from '../../components/base/Input'
import { Textarea } from '../../components/base/Textarea'
import { Tag } from '../../components/base/Tag'
import { PrimaryButton } from '../../components/base/Button'
import { EmptyState } from '../../components/base/EmptyState'
import { LoadingState } from '../../components/base/LoadingState'
import { getCurrentUser, updateCurrentUser } from '../../services/user'

export default function EditProfile() {
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [role, setRole] = useState<string>('Coser')
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const u = await getCurrentUser()
      setNickname(u.nickname)
      setBio(u.bio || '')
      setCity(u.city || '')
      setRole(u.roleType && u.roleType !== 'user' ? u.roleType : 'Coser')
      setAvatarUrl(u.avatarUrl)
    } catch (err: any) {
      setError(err?.message || '资料加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const submit = async () => {
    if (!nickname.trim()) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      const user = await updateCurrentUser({
        nickname: nickname.trim(),
        bio: bio.trim(),
        city: city.trim(),
        roleType: role
      })
      setNickname(user.nickname)
      setBio(user.bio || '')
      setCity(user.city || '')
      setRole(user.roleType || role)
      setAvatarUrl(user.avatarUrl)
      Taro.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 300)
    } catch (err: any) {
      Taro.showToast({ title: err?.message || '保存失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState fullScreen text="资料加载中..." />
  if (error) return <EmptyState title="加载失败" description={error} actionText="重试" onAction={loadData} />

  return (
    <View className="page-container" style={{ padding: 'var(--space-lg)' }}>
      <View style={{ display: 'flex', alignItems: 'center', gap: '24rpx', marginBottom: '24rpx' }}>
        <Avatar src={avatarUrl} size={120} />
        <Text>头像占位（当前阶段不改图）</Text>
      </View>
      <Input label="昵称" value={nickname} onInput={e => setNickname((e.detail as any).value)} />
      <Textarea label="个性签名" value={bio} onInput={e => setBio((e.detail as any).value)} maxlength={80} showCount />
      <Input label="城市" value={city} onInput={e => setCity((e.detail as any).value)} placeholder="例如：广州" />
      <Text style={{ marginBottom: '12rpx' }}>身份标签</Text>
      <View style={{ display: 'flex', gap: '12rpx', marginBottom: '24rpx' }}>
        {['Coser', '摄影', '妆娘'].map(t => (
          <View key={t} onClick={() => setRole(t)}>
            <Tag type={role === t ? 'primary' : 'default'} outline={role !== t} size="medium">{t}</Tag>
          </View>
        ))}
      </View>
      <PrimaryButton block loading={submitting} onClick={submit}>保存</PrimaryButton>
    </View>
  )
}
