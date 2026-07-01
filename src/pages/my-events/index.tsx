import { View, Text, Image } from '@tarojs/components'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { EmptyState } from '../../components/base/EmptyState'
import { LoadingState } from '../../components/base/LoadingState'
import { isGuestMode, promptLogin } from '../../services/request'
import { consumeMyEventsShouldRefresh } from '../../services/events'
import { consumeDemandListShouldRefresh, consumeMyAppliedDemandsShouldRefresh } from '../../services/demands'
import { getMyBookings, type MyBookingItem } from '../../services/profile'
import { cancelVenueBooking } from '../../services/venues'
import { useThemeMode } from '../../config/theme'
import './index.scss'

export default function MyEvents() {
  const [list, setList] = useState<MyBookingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState('')
  const { theme } = useThemeMode()

  const loadData = useCallback(async () => {
    if (isGuestMode()) {
      setList([])
      setError('')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const bookings = await getMyBookings()
      setList(bookings)
    } catch (err: any) {
      setError(err?.message || '预约页面加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useDidShow(() => {
    const shouldRefresh =
      consumeMyEventsShouldRefresh() ||
      consumeMyAppliedDemandsShouldRefresh() ||
      consumeDemandListShouldRefresh()

    if (shouldRefresh) {
      loadData()
    }
  })

  const summary = useMemo(
    () => ({
      total: list.length,
      eventCount: list.filter((item) => item.bizType === 'event_registration').length,
      venueCount: list.filter((item) => item.bizType === 'venue_booking').length,
      demandCount: list.filter((item) => item.bizType === 'demand_created' || item.bizType === 'demand_applied').length
    }),
    [list]
  )

  const getBookingTypeText = (item: MyBookingItem) => {
    if (item.bizType === 'event_registration') return '活动报名'
    if (item.bizType === 'venue_booking') return '场地预约'
    if (item.bizType === 'demand_created') return '我发起的'
    return '我报名的'
  }

  const getBookingBadgeText = (item: MyBookingItem) => {
    if (item.bizType === 'event_registration') return '活动'
    if (item.bizType === 'venue_booking') return '场地'
    return '邀约'
  }

  const openBooking = (item: MyBookingItem) => {
    if (item.bizType === 'event_registration') {
      Taro.navigateTo({ url: `/pages/event-detail/index?id=${item.targetId}` })
      return
    }
    if (item.bizType === 'demand_created' || item.bizType === 'demand_applied') {
      Taro.navigateTo({ url: `/pages/demand-detail/index?id=${item.targetId}` })
      return
    }
    Taro.navigateTo({
      url: `/pages/venues/index?venueId=${item.venueId || ''}&sceneId=${item.sceneId || ''}`
    })
  }

  const handleCancelVenueBooking = async (item: MyBookingItem, e: any) => {
    e?.stopPropagation?.()
    if (!item.cancelable || item.bizType !== 'venue_booking') return

    const confirm = await Taro.showModal({
      title: '取消场地预约',
      content: `确认取消“${item.title}”吗？`,
      confirmText: '确认取消'
    })
    if (!confirm.confirm) return

    setCancellingId(item.id)
    try {
      await cancelVenueBooking(item.targetId)
      Taro.showToast({ title: '已取消预约', icon: 'success' })
      await loadData()
    } catch (err: any) {
      Taro.showToast({ title: err?.message || '取消失败', icon: 'none' })
    } finally {
      setCancellingId('')
    }
  }

  if (loading) return <LoadingState fullScreen text="预约页面加载中..." />

  return (
    <View className={`my-participation page-container theme-${theme}`}>
      <View className="my-participation__hero">
        <Text className="my-participation__hero-title">我的预约</Text>
        <Text className="my-participation__hero-desc">统一查看你在不同模块里的预约记录，列表聚合展示，进入后按对应模块打开详情。</Text>
        <View className="my-participation__stats">
          <View className="my-participation__stat-card">
            <Text className="my-participation__stat-value">{summary.total}</Text>
            <Text className="my-participation__stat-label">预约总数</Text>
          </View>
          <View className="my-participation__stat-card">
            <Text className="my-participation__stat-value">{summary.demandCount}</Text>
            <Text className="my-participation__stat-label">邀约日程</Text>
          </View>
          <View className="my-participation__stat-card">
            <Text className="my-participation__stat-value">{summary.venueCount}</Text>
            <Text className="my-participation__stat-label">场地预约</Text>
          </View>
        </View>
      </View>

      {error ? (
        <EmptyState title="加载失败" description={error} actionText="重试" onAction={loadData} />
      ) : isGuestMode() ? (
        <EmptyState title="游客暂无预约记录" description="登录后可查看活动报名和场地预约。" actionText="去登录" onAction={() => promptLogin('请先登录')} />
      ) : list.length === 0 ? (
        <EmptyState title="暂无预约记录" description="你在活动和场地模块里的预约，会统一汇总展示在这里。" />
      ) : (
        <View className="my-participation__schedule-list">
          {list.map((item) => (
            <View key={item.id} className="my-participation__schedule-card" onClick={() => openBooking(item)}>
              <View className="my-participation__schedule-top">
                <View className="my-participation__schedule-top-main">
                  <Text className="my-participation__schedule-role">
                    {getBookingTypeText(item)}
                  </Text>
                  <Text className="my-participation__schedule-badge">
                    {getBookingBadgeText(item)}
                  </Text>
                </View>
                <Text className="my-participation__schedule-status">{item.status || '已预约'}</Text>
              </View>
              <View className="my-participation__schedule-main">
                {item.coverImage ? <Image className="my-participation__schedule-cover" src={item.coverImage} mode="aspectFill" /> : null}
                <View className="my-participation__schedule-content">
                  <Text className="my-participation__schedule-title">{item.title}</Text>
                  {item.subtitle ? <Text className="my-participation__schedule-subtitle">{item.subtitle}</Text> : null}
                  <View className="my-participation__schedule-meta">
                    <Text className="my-participation__schedule-meta-label">时间</Text>
                    <Text className="my-participation__schedule-meta-value">{item.displayTime || '待定'}</Text>
                  </View>
                  <View className="my-participation__schedule-meta">
                    <Text className="my-participation__schedule-meta-label">地点</Text>
                    <Text className="my-participation__schedule-meta-value">{item.location || '待定'}</Text>
                  </View>
                </View>
              </View>
              <View className="my-participation__schedule-footer">
                {item.bizType === 'venue_booking' && item.cancelable ? (
                  <View
                    className={`my-participation__schedule-cancel ${cancellingId === item.id ? 'is-disabled' : ''}`}
                    onClick={(e) => handleCancelVenueBooking(item, e)}
                  >
                    <Text>{cancellingId === item.id ? '取消中...' : '取消预约'}</Text>
                  </View>
                ) : null}
                <Text className="my-participation__schedule-action">{item.actionText}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
