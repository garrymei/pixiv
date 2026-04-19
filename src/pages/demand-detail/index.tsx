import { View, Text, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useCallback, useEffect, useState } from 'react'
import { Tag } from '../../components/base/Tag'
import { Button } from '../../components/base/Button'
import { EmptyState } from '../../components/base/EmptyState'
import { LoadingState } from '../../components/base/LoadingState'
import {
  applyDemand,
  getDemandApplicationStatus,
  getDemandById,
  markMyAppliedDemandsShouldRefresh
} from '../../services/demands'
import './index.scss'

function getApplyErrorMessage(error: any) {
  const message = String(error?.message || '')
  if (message === 'already applied') return '你已经申请过该需求了'
  if (message === 'deadline passed') return '该需求已截止报名'
  if (message === 'full') return '该需求名额已满'
  if (message === 'closed') return '该需求已关闭'
  if (message === 'demand not found') return '需求不存在或已下线'
  return message || '申请失败'
}

export default function DemandDetail() {
  const [id, setId] = useState('')
  const [marketMain, setMarketMain] = useState<'seek' | 'offer' | ''>('')
  const [demand, setDemand] = useState<any>()
  const [applied, setApplied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useLoad((options) => {
    setId(String(options?.id || ''))
    const nextMain = String((options as any)?.marketMain || '')
    setMarketMain(nextMain === 'seek' || nextMain === 'offer' ? nextMain : '')
  })

  const loadData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const [detail, status] = await Promise.all([
        getDemandById(id),
        getDemandApplicationStatus(id).catch(() => ({ applied: false }))
      ])
      setDemand(detail)
      setApplied(status.applied)
      if (!detail) setError('需求不存在')
    } catch (err: any) {
      setError(err?.message || '需求加载失败')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleApply = async () => {
    if (!demand) return
    if (applied) {
      Taro.showToast({ title: '你已经申请过该需求了', icon: 'none' })
      return
    }
    if (demand.status === 'closed') {
      Taro.showToast({ title: '该需求已关闭', icon: 'none' })
      return
    }
    if (demand.deadline && Date.now() > demand.deadline) {
      Taro.showToast({ title: '该需求已截止报名', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      await applyDemand(id)
      setApplied(true)
      markMyAppliedDemandsShouldRefresh()
      Taro.showToast({ title: '已申请', icon: 'success' })
    } catch (err: any) {
      Taro.showToast({ title: getApplyErrorMessage(err), icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState fullScreen text="需求加载中..." />
  if (error || !demand) return <EmptyState title="加载失败" description={error || '需求不存在'} actionText="重试" onAction={loadData} />

  const normalizeMarketType = (rawType: string) => {
    const normalized = String(rawType || '').replace(/^(找|本)/, '')
    if (normalized === '摄影') return '摄影'
    if (normalized === '妆娘') return '妆娘'
    if (normalized === '毛娘') return '毛娘'
    return '其他'
  }

  const formatDisplayType = (main: 'seek' | 'offer', rawType: string) => {
    if (!rawType) return rawType
    const normalized = normalizeMarketType(rawType)
    if (normalized === '其他') return '其他'
    const prefix = main === 'seek' ? '找' : '本'
    return `${prefix}${normalized}`
  }

  const displayType = marketMain ? formatDisplayType(marketMain, demand.type) : demand.type

  return (
    <View className="page-container" style={{ paddingBottom: 'var(--safe-area-bottom)' }}>
      <View style={{ padding: 'var(--space-lg)' }}>
        <Text style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>
          {demand.title}
        </Text>
        <View style={{ display: 'flex', gap: '8rpx', marginTop: '12rpx' }}>
          <Tag type="primary" size="small">{displayType}</Tag>
          {demand.budget && <Tag type="secondary" size="small">{demand.budget}</Tag>}
        </View>
        <View style={{ marginTop: '12rpx', color: 'var(--color-text-secondary)' }}>
          <Text>时间：{demand.time || '待定'}</Text>
        </View>
        <View style={{ marginTop: '8rpx', color: 'var(--color-text-secondary)' }}>
          <Text>地点：{demand.location || '待定'}</Text>
        </View>
        <View style={{ marginTop: '8rpx', color: 'var(--color-text-secondary)' }}>
          <Text>状态：{demand.statusText || (demand.status === 'closed' ? '已关闭' : '招募中')}</Text>
        </View>
        <View style={{ marginTop: '8rpx', color: 'var(--color-text-secondary)' }}>
          <Text>人数：{demand.participantLimit || '未限制'}</Text>
        </View>
        <View style={{ marginTop: '8rpx', color: 'var(--color-text-secondary)' }}>
          <Text>截止：{demand.deadlineText || '未设置'}</Text>
        </View>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx', marginTop: '12rpx' }}>
          <View style={{ width: '64rpx', height: '64rpx', borderRadius: '50%', backgroundColor: 'var(--color-bg-card)' }}>
            <Image src={demand.authorAvatar} mode="aspectFill" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
          </View>
          <Text style={{ color: 'var(--color-text-secondary)' }}>{demand.authorName}</Text>
        </View>
        <View style={{ marginTop: '16rpx' }}>
          <Text style={{ color: 'var(--color-text-regular)' }}>{demand.content || '暂无详细说明'}</Text>
        </View>
        <View style={{ marginTop: '24rpx' }}>
          <Button
            block
            type={applied || demand.status === 'closed' || (demand.deadline && Date.now() > demand.deadline) ? 'secondary' : 'primary'}
            loading={submitting}
            disabled={applied || demand.status === 'closed' || !!(demand.deadline && Date.now() > demand.deadline)}
            onClick={handleApply}
          >
            {applied ? '已申请' : demand.status === 'closed' ? '已关闭' : demand.deadline && Date.now() > demand.deadline ? '已截止' : '感兴趣'}
          </Button>
        </View>
      </View>
    </View>
  )
}
