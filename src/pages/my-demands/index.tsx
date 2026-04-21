import { View } from '@tarojs/components'
import { useCallback, useEffect, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { DemandCard } from '../../components/business/DemandCard'
import { EmptyState } from '../../components/base/EmptyState'
import { LoadingState } from '../../components/base/LoadingState'
import { consumeDemandListShouldRefresh, listMyDemands } from '../../services/demands'
import { useThemeMode } from '../../config/theme'

export default function MyDemands() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { theme } = useThemeMode()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listMyDemands()
      setList(data)
    } catch (err: any) {
      setError(err?.message || '我的需求加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useDidShow(() => {
    if (consumeDemandListShouldRefresh()) {
      loadData()
    }
  })

  if (loading) return <LoadingState fullScreen text="我的需求加载中..." />

  return (
    <View className={`page-container theme-${theme}`} style={{ padding: 'var(--space-md)' }}>
      {error ? (
        <EmptyState title="加载失败" description={error} actionText="重试" onAction={loadData} />
      ) : list.length === 0 ? (
        <EmptyState title="暂无需求" />
      ) : (
        list.map(d => (
          <DemandCard
            key={d.id}
            type={d.type}
            title={d.title}
            budget={d.budget}
            location={d.location}
            time={d.time}
            createTime={d.createTime}
            authorName={d.authorName}
            authorAvatar={d.authorAvatar}
            status={d.status}
            onClick={() => Taro.navigateTo({ url: `/pages/demand-detail/index?id=${d.id}` })}
            onActionClick={() => Taro.navigateTo({ url: `/pages/demand-detail/index?id=${d.id}` })}
          />
        ))
      )}
    </View>
  )
}
