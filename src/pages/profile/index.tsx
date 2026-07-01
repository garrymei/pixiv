import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useCallback, useState } from 'react'
import { ProfileHeader } from '../../components/business/ProfileHeader'
import { StatShortcutGrid } from '../../components/business/StatShortcutGrid'
import { Tag } from '../../components/base/Tag'
import { EmptyState } from '../../components/base/EmptyState'
import { LoadingState } from '../../components/base/LoadingState'
import { getProfileSummary } from '../../services/profile'
import { isGuestMode, promptLogin } from '../../services/request'
import { useThemeMode } from '../../config/theme'
import './index.scss'

export default function Profile() {
  const [user, setUser] = useState<any>()
  const [stats, setStats] = useState<any>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { theme } = useThemeMode()

  const loadData = useCallback(async () => {
    if (isGuestMode()) {
      setUser(undefined)
      setStats(undefined)
      setError('')
      setLoading(false)
      return
    }
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
  const participationCount =
    stats?.participationCount ?? ((stats?.eventsCount ?? 0) + (stats?.demandApplicationsCount ?? 0))
  const isGuest = isGuestMode() || user?.roleType === 'guest'

  if (isGuest) {
    return (
      <View className={`page-profile page-container theme-${theme}`}>
        <View className="profile-guest">
          <EmptyState
            title="登录后查看个人中心"
            description="游客模式仅支持浏览内容。登录后可点赞、评论、发布、报名、查看个人数据并编辑资料。"
            actionText="去登录"
            onAction={() => promptLogin('请先登录')}
          />
        </View>
      </View>
    )
  }

  if (loading) return <LoadingState fullScreen text="个人中心加载中..." />
  if (error || !user) return <EmptyState title="加载失败" description={error || '用户不存在'} actionText="重试" onAction={loadData} />

  return (
    <View className={`page-profile page-container theme-${theme}`}>
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
          { id: 's1', label: '发布', value: stats?.postsCount ?? 0, onClick: () => (isGuest ? promptLogin('登录后查看我的发布') : Taro.navigateTo({ url: '/pages/my-posts/index' })) },
          { id: 's2', label: '需求', value: stats?.demandsCount ?? 0, onClick: () => (isGuest ? promptLogin('登录后查看我的需求') : Taro.navigateTo({ url: '/pages/my-demands/index' })) },
          { id: 's3', label: '预约', value: participationCount, onClick: () => (isGuest ? promptLogin('登录后查看预约记录') : Taro.navigateTo({ url: '/pages/my-events/index' })) }
        ]}
      />

      <View className="profile-section">
        <Text className="section-title">常用功能</Text>
      </View>
      <View className="profile-menu">
        <View className="profile-menu__item" onClick={() => (isGuest ? promptLogin('登录后查看我的发布') : Taro.navigateTo({ url: '/pages/my-posts/index' }))}><Text>我的发布</Text></View>
        <View className="profile-menu__item" onClick={() => (isGuest ? promptLogin('登录后查看我的需求') : Taro.navigateTo({ url: '/pages/my-demands/index' }))}><Text>我的需求</Text></View>
        <View className="profile-menu__item" onClick={() => (isGuest ? promptLogin('登录后查看预约记录') : Taro.navigateTo({ url: '/pages/my-events/index' }))}><Text>我的预约</Text></View>
        <View className="profile-menu__item" onClick={() => (isGuest ? promptLogin('登录后编辑资料') : Taro.navigateTo({ url: '/pages/edit-profile/index' }))}><Text>编辑资料</Text></View>
        <View className="profile-menu__item" onClick={() => Taro.navigateTo({ url: '/pages/settings/index' })}><Text>设置</Text></View>
      </View>
    </View>
  )
}
