import { View, Text } from '@tarojs/components'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { EventCard } from '../../components/business/EventCard'
import { EmptyState } from '../../components/base/EmptyState'
import { LoadingState } from '../../components/base/LoadingState'
import { consumeMyEventsShouldRefresh, listMyEvents } from '../../services/events'
import {
  consumeDemandListShouldRefresh,
  consumeMyAppliedDemandsShouldRefresh,
  listMyAppliedDemands,
  listMyDemands
} from '../../services/demands'
import { useThemeMode } from '../../config/theme'
import './index.scss'

type ParticipationTab = 'official' | 'schedule'

type ScheduleCardItem = {
  id: string
  title: string
  roleLabel: string
  subtitle: string
  badge?: string
  time: string
  location: string
  actionText: string
  onClick: () => void
}

export default function MyEvents() {
  const [tab, setTab] = useState<ParticipationTab>('official')
  const [officialList, setOfficialList] = useState<any[]>([])
  const [createdSchedules, setCreatedSchedules] = useState<any[]>([])
  const [joinedSchedules, setJoinedSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { theme } = useThemeMode()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [events, myDemands, appliedDemands] = await Promise.all([
        listMyEvents(),
        listMyDemands(),
        listMyAppliedDemands()
      ])
      setOfficialList(events)
      setCreatedSchedules(myDemands)
      setJoinedSchedules(appliedDemands)
    } catch (err: any) {
      setError(err?.message || '参与页面加载失败')
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

  const scheduleSummary = useMemo(
    () => ({
      createdCount: createdSchedules.length,
      joinedCount: joinedSchedules.length,
      total: createdSchedules.length + joinedSchedules.length
    }),
    [createdSchedules, joinedSchedules]
  )

  const createdItems = useMemo<ScheduleCardItem[]>(
    () =>
      createdSchedules
        .filter((item) => item.applicationCount === undefined || item.applicationCount > 0)
        .map((item) => ({
          id: `created-${item.id}`,
          title: item.title,
          roleLabel: '我发布的',
          badge: '发起',
          subtitle:
            item.scheduleStatusText ||
            (item.applicationCount && item.applicationCount > 0
              ? `已有 ${item.applicationCount} 人报名`
              : item.statusText || (item.status === 'closed' ? '已关闭' : '招募中')),
          time: item.time || '时间待定',
          location: item.location || '地点待定',
          actionText: '查看详情',
          onClick: () => Taro.navigateTo({ url: `/pages/demand-detail/index?id=${item.id}` })
        })),
    [createdSchedules]
  )

  const joinedItems = useMemo<ScheduleCardItem[]>(
    () =>
      joinedSchedules.map((item) => ({
        id: `joined-${item.id}`,
        title: item.title,
        roleLabel: '我报名的',
        badge: '报名',
        subtitle: item.scheduleStatusText || item.statusText || (item.status === 'closed' ? '已关闭' : '待沟通'),
        time: item.time || '时间待定',
        location: item.location || '地点待定',
        actionText: '查看详情',
        onClick: () => Taro.navigateTo({ url: `/pages/demand-detail/index?id=${item.id}` })
      })),
    [joinedSchedules]
  )

  if (loading) return <LoadingState fullScreen text="参与页面加载中..." />

  const renderScheduleSection = (title: string, description: string, items: ScheduleCardItem[]) => {
    if (items.length === 0) return null

    return (
      <View className="my-participation__section">
        <View className="my-participation__section-head">
          <Text className="my-participation__section-title">{title}</Text>
          <Text className="my-participation__section-desc">{description}</Text>
        </View>
        <View className="my-participation__schedule-list">
          {items.map((item) => (
            <View key={item.id} className="my-participation__schedule-card" onClick={item.onClick}>
              <View className="my-participation__schedule-top">
                <View className="my-participation__schedule-top-main">
                  <Text className="my-participation__schedule-role">{item.roleLabel}</Text>
                  {item.badge ? <Text className="my-participation__schedule-badge">{item.badge}</Text> : null}
                </View>
                <Text className="my-participation__schedule-status">{item.subtitle}</Text>
              </View>
              <Text className="my-participation__schedule-title">{item.title}</Text>
              <View className="my-participation__schedule-meta">
                <Text className="my-participation__schedule-meta-label">时间</Text>
                <Text className="my-participation__schedule-meta-value">{item.time}</Text>
              </View>
              <View className="my-participation__schedule-meta">
                <Text className="my-participation__schedule-meta-label">地点</Text>
                <Text className="my-participation__schedule-meta-value">{item.location}</Text>
              </View>
              <View className="my-participation__schedule-footer">
                <Text className="my-participation__schedule-action">{item.actionText}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    )
  }

  return (
    <View className={`my-participation page-container theme-${theme}`}>
      <View className="my-participation__hero">
        <Text className="my-participation__hero-title">参与</Text>
        <Text className="my-participation__hero-desc">统一查看官方活动报名和与你相关的个人日程，减少“活动”和“参与”的歧义。</Text>
        <View className="my-participation__stats">
          <View className="my-participation__stat-card">
            <Text className="my-participation__stat-value">{officialList.length}</Text>
            <Text className="my-participation__stat-label">参与活动</Text>
          </View>
          <View className="my-participation__stat-card">
            <Text className="my-participation__stat-value">{scheduleSummary.total}</Text>
            <Text className="my-participation__stat-label">我的日程</Text>
          </View>
        </View>
        {tab === 'schedule' ? (
          <View className="my-participation__summary-strip">
            <Text className="my-participation__summary-text">我发起 {scheduleSummary.createdCount}</Text>
            <Text className="my-participation__summary-dot">·</Text>
            <Text className="my-participation__summary-text">我报名 {scheduleSummary.joinedCount}</Text>
          </View>
        ) : null}
      </View>

      <View className="my-participation__tabs">
        <View
          className={`my-participation__tab ${tab === 'official' ? 'is-active' : ''}`}
          onClick={() => setTab('official')}
        >
          <Text>参与活动</Text>
        </View>
        <View
          className={`my-participation__tab ${tab === 'schedule' ? 'is-active' : ''}`}
          onClick={() => setTab('schedule')}
        >
          <Text>我的日程</Text>
        </View>
      </View>

      {error ? (
        <EmptyState title="加载失败" description={error} actionText="重试" onAction={loadData} />
      ) : tab === 'official' ? (
        officialList.length === 0 ? (
          <EmptyState title="暂无参与活动" description="你报名的官方活动会统一展示在这里。" />
        ) : (
          <View className="my-participation__list">
            {officialList.map((ev) => (
              <View key={ev.id}>
                <EventCard
                  coverUrl={ev.coverUrl}
                  title={ev.title}
                  time={ev.time}
                  location={ev.location}
                  status={ev.status}
                  price={ev.price}
                  capacity={ev.capacity ? `名额：${ev.capacity}` : '名额：未限制'}
                  deadline={ev.registrationDeadlineText ? `截止：${ev.registrationDeadlineText}` : undefined}
                  actionText={ev.status === 'ended' ? '已结束' : '查看详情'}
                  onActionClick={() => Taro.navigateTo({ url: `/pages/event-detail/index?id=${ev.id}` })}
                  onClick={() => Taro.navigateTo({ url: `/pages/event-detail/index?id=${ev.id}` })}
                />
                <Text className="my-participation__event-note">
                  报名时间：{ev.registeredAtText || '已报名'}
                </Text>
              </View>
            ))}
          </View>
        )
      ) : scheduleSummary.total === 0 ? (
        <EmptyState title="暂无日程" description="你发布或报名的邀约会在这里汇总展示。" />
      ) : (
        <View className="my-participation__schedule">
          {renderScheduleSection('我发起的', '优先展示你发布且已有人报名的内容，方便继续跟进。', createdItems)}
          {renderScheduleSection('我报名的', '展示你报名别人发布的内容，点击可直接进入详情。', joinedItems)}
        </View>
      )}
    </View>
  )
}
