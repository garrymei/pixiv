import { View, Text } from '@tarojs/components'
import { useCallback, useEffect, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { EventCard } from '../../components/business/EventCard'
import { EmptyState } from '../../components/base/EmptyState'
import { LoadingState } from '../../components/base/LoadingState'
import { consumeMyEventsShouldRefresh, listMyEvents } from '../../services/events'
import { useThemeMode } from '../../config/theme'

export default function MyEvents() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { theme } = useThemeMode()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listMyEvents()
      setList(data)
    } catch (err: any) {
      setError(err?.message || '我的活动加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useDidShow(() => {
    if (consumeMyEventsShouldRefresh()) {
      loadData()
    }
  })

  if (loading) return <LoadingState fullScreen text="我的活动加载中..." />

  return (
    <View className={`page-container theme-${theme}`} style={{ padding: 'var(--space-md)' }}>
      {error ? (
        <EmptyState title="加载失败" description={error} actionText="重试" onAction={loadData} />
      ) : list.length === 0 ? (
        <EmptyState title="暂无活动" />
      ) : (
        list.map(ev => (
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
            <Text style={{ margin: '0 0 var(--space-md)', display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              报名时间：{ev.registeredAtText || '已报名'}
            </Text>
          </View>
        ))
      )}
    </View>
  )
}
