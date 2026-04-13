import { View, Text } from '@tarojs/components'
import { useCallback, useEffect, useState } from 'react'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import { EventCard } from '../../components/business/EventCard'
import { EmptyState } from '../../components/base/EmptyState'
import { LoadingState } from '../../components/base/LoadingState'
import { listEvents } from '../../services/events'
import './index.scss'

export default function Events() {
  const [tab, setTab] = useState<'info' | 'official'>('info')
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getActionText = (status: string, isRegisterable?: boolean) => {
    if (status === 'ended') return '已结束'
    if (!isRegisterable) return '查看详情'
    return '立即报名'
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const list = await listEvents(tab)
      setEvents(list)
    } catch (err: any) {
      setError(err?.message || '活动加载失败')
    } finally {
      setLoading(false)
      Taro.stopPullDownRefresh()
    }
  }, [tab])

  useEffect(() => {
    loadData()
  }, [loadData])

  usePullDownRefresh(() => {
    loadData()
  })

  return (
    <View className="page-events page-container">
      <View className="events-tabs">
        <Text className={tab === 'info' ? 'events-tab events-tab--active' : 'events-tab'} onClick={() => setTab('info')}>
          活动资讯
        </Text>
        <Text className={tab === 'official' ? 'events-tab events-tab--active' : 'events-tab'} onClick={() => setTab('official')}>
          官方活动
        </Text>
      </View>

      <View className="events-list">
        {loading ? (
          <LoadingState text="活动加载中..." />
        ) : error ? (
          <EmptyState title="加载失败" description={error} actionText="重试" onAction={loadData} />
        ) : events.length === 0 ? (
          <EmptyState title="暂无活动" />
        ) : (
          events.map((ev) => (
            <EventCard
              key={ev.id}
              coverUrl={ev.coverUrl}
              title={ev.title}
              time={ev.time}
              location={ev.location}
              status={ev.status}
              price={ev.price}
              capacity={ev.capacity ? `名额：${ev.capacity}` : '名额：未限制'}
              deadline={ev.registrationDeadlineText ? `截止：${ev.registrationDeadlineText}` : undefined}
              actionText={getActionText(ev.status, ev.isRegisterable)}
              onClick={() => Taro.navigateTo({ url: `/pages/event-detail/index?id=${ev.id}` })}
              onActionClick={() => Taro.navigateTo({ url: `/pages/event-detail/index?id=${ev.id}` })}
            />
          ))
        )}
      </View>
    </View>
  )
}
