import { View } from '@tarojs/components'
import { useCallback, useEffect, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { DemandCard } from '../../components/business/DemandCard'
import { EmptyState } from '../../components/base/EmptyState'
import { LoadingState } from '../../components/base/LoadingState'
import { consumeMyAppliedDemandsShouldRefresh, listMyAppliedDemands } from '../../services/demands'

export default function MyAppliedDemands() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listMyAppliedDemands()
      setList(data)
    } catch (err: any) {
      setError(err?.message || '我的参与加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useDidShow(() => {
    if (consumeMyAppliedDemandsShouldRefresh()) {
      loadData()
    }
  })

  if (loading) return <LoadingState fullScreen text="我的参与加载中..." />

  return (
    <View className="page-container" style={{ padding: 'var(--space-md)' }}>
      {error ? (
        <EmptyState title="加载失败" description={error} actionText="重试" onAction={loadData} />
      ) : list.length === 0 ? (
        <EmptyState title="暂无参与记录" />
      ) : (
        list.map((demand) => (
          <DemandCard
            key={demand.id}
            type={demand.type}
            title={demand.title}
            budget={demand.budget}
            location={demand.location}
            time={demand.time}
            createTime={demand.createTime}
            authorName={demand.authorName}
            authorAvatar={demand.authorAvatar}
            status={demand.status}
            onClick={() => Taro.navigateTo({ url: `/pages/demand-detail/index?id=${demand.id}` })}
            onActionClick={() => Taro.navigateTo({ url: `/pages/demand-detail/index?id=${demand.id}` })}
          />
        ))
      )}
    </View>
  )
}
