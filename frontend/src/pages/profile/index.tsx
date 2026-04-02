import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useCallback, useState } from 'react'
import { ProfileHeader } from '../../components/business/ProfileHeader'
import { StatShortcutGrid } from '../../components/business/StatShortcutGrid'
import { Tag } from '../../components/base/Tag'
import { EmptyState } from '../../components/base/EmptyState'
import { LoadingState } from '../../components/base/LoadingState'
import { getProfileSummary } from '../../services/profile'
import './index.scss'

export default function Profile() {
  const [user, setUser] = useState<any>()
  const [stats, setStats] = useState<any>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const summary = await getProfileSummary()
      setUser(summary.user)
      setStats(summary.stats)
    } catch (err: any) {
      setError(err?.message || '个人中心加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useDidShow(() => {
    loadData()
  })

  const roleLabel = user?.roleType === 'user' ? '普通用户' : (user?.roleType || '普通用户')

  if (loading) return <LoadingState fullScreen text="个人中心加载中..." />
  if (error || !user) return <EmptyState title="加载失败" description={error || '用户不存在'} actionText="重试" onAction={loadData} />

  return (
    <View className="page-profile page-container">
      <ProfileHeader
        nickname={user.nickname}
        avatar={user.avatarUrl}
        bgUrl={user.bgUrl}
        bio={user.bio}
        isSelf
        followersCount={user.followersCount}
        followingCount={user.followingCount}
        onEditClick={() => Taro.navigateTo({ url: '/pages/edit-profile/index' })}
      />

      <View className="profile-section">
        <Text className="section-title">身份标签</Text>
      </View>
      <View className="profile-tags">
        <Tag type="primary" size="medium">{roleLabel}</Tag>
        {user.city ? <Tag type="secondary" size="medium">{user.city}</Tag> : null}
      </View>

      <View className="profile-section">
        <Text className="section-title">我的概览</Text>
      </View>
      <StatShortcutGrid
        items={[
          { id: 's1', label: '发布', value: stats?.postsCount ?? 0, onClick: () => Taro.navigateTo({ url: '/pages/my-posts/index' }) },
          { id: 's2', label: '需求', value: stats?.demandsCount ?? 0, onClick: () => Taro.navigateTo({ url: '/pages/my-demands/index' }) },
          { id: 's3', label: '活动', value: stats?.eventsCount ?? 0, onClick: () => Taro.navigateTo({ url: '/pages/my-events/index' }) },
          { id: 's4', label: '参与', value: stats?.demandApplicationsCount ?? 0, onClick: () => Taro.navigateTo({ url: '/pages/my-applied-demands/index' }) }
        ]}
      />

      <View className="profile-section">
        <Text className="section-title">常用功能</Text>
      </View>
      <View className="profile-menu">
        <View className="profile-menu__item" onClick={() => Taro.navigateTo({ url: '/pages/my-posts/index' })}><Text>我的发布</Text></View>
        <View className="profile-menu__item" onClick={() => Taro.navigateTo({ url: '/pages/my-events/index' })}><Text>我的活动</Text></View>
        <View className="profile-menu__item" onClick={() => Taro.navigateTo({ url: '/pages/my-demands/index' })}><Text>我的需求</Text></View>
        <View className="profile-menu__item" onClick={() => Taro.navigateTo({ url: '/pages/my-applied-demands/index' })}><Text>我的参与</Text></View>
        <View className="profile-menu__item" onClick={() => Taro.navigateTo({ url: '/pages/edit-profile/index' })}><Text>编辑资料</Text></View>
      </View>
    </View>
  )
}
