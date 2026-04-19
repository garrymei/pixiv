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
import { uploadImage } from '../../services/uploads'

export default function EditProfile() {
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [role, setRole] = useState<string>('Coser')
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)
  const [avatarReviewStatus, setAvatarReviewStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | undefined>(undefined)
  const [avatarReviewReason, setAvatarReviewReason] = useState('')
  const [avatarPendingUrl, setAvatarPendingUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
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
      setAvatarReviewStatus(u.avatarReviewStatus)
      setAvatarReviewReason(u.avatarReviewReason || '')
      setAvatarPendingUrl(u.avatarPendingUrl || '')
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
      setAvatarReviewStatus(user.avatarReviewStatus)
      setAvatarReviewReason(user.avatarReviewReason || '')
      setAvatarPendingUrl(user.avatarPendingUrl || '')
      Taro.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 300)
    } catch (err: any) {
      Taro.showToast({ title: err?.message || '保存失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const chooseAvatar = async () => {
    if (uploadingAvatar || submitting) return
    try {
      const picked = await Taro.chooseImage({ count: 1 })
      const localPath = picked.tempFilePaths?.[0]
      if (!localPath) return
      setUploadingAvatar(true)
      const uploaded = await uploadImage(localPath)
      const user = await updateCurrentUser({
        nickname: nickname.trim() || '未命名用户',
        bio: bio.trim(),
        city: city.trim(),
        roleType: role,
        avatar: uploaded.url
      })
      setAvatarUrl(user.avatarUrl)
      setAvatarReviewStatus(user.avatarReviewStatus)
      setAvatarReviewReason(user.avatarReviewReason || '')
      setAvatarPendingUrl(user.avatarPendingUrl || '')
      Taro.showToast({
        title: user.avatarReviewStatus === 'PENDING' ? '头像已提交审核' : '头像更新成功',
        icon: 'success'
      })
    } catch (err: any) {
      if (String(err?.errMsg || '').includes('cancel')) return
      Taro.showToast({ title: err?.message || '头像上传失败', icon: 'none' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (loading) return <LoadingState fullScreen text="资料加载中..." />
  if (error) return <EmptyState title="加载失败" description={error} actionText="重试" onAction={loadData} />

  return (
    <View className="page-container" style={{ padding: 'var(--space-lg)' }}>
      <View style={{ display: 'flex', alignItems: 'center', gap: '24rpx', marginBottom: '24rpx' }}>
        <View onClick={chooseAvatar}>
          <Avatar src={avatarUrl} size={120} />
        </View>
        <View>
          <Text onClick={chooseAvatar}>{uploadingAvatar ? '上传中...' : '点击上传新头像'}</Text>
          {avatarReviewStatus === 'PENDING' && (
            <Text style={{ display: 'block', color: 'var(--color-warning)', marginTop: '8rpx' }}>
              新头像审核中，当前仍展示旧头像
            </Text>
          )}
          {avatarReviewStatus === 'REJECTED' && (
            <Text style={{ display: 'block', color: 'var(--color-error)', marginTop: '8rpx' }}>
              头像未通过：{avatarReviewReason || '请更换后重试'}
            </Text>
          )}
          {avatarPendingUrl && avatarReviewStatus === 'PENDING' && (
            <Text style={{ display: 'block', color: 'var(--color-text-secondary)', marginTop: '8rpx' }}>
              已提交审核头像：{avatarPendingUrl}
            </Text>
          )}
        </View>
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
