import { View, Text, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useCallback, useEffect, useState } from 'react'
import { PrimaryButton } from '../../components/base/Button'
import { EmptyState } from '../../components/base/EmptyState'
import { LoadingState } from '../../components/base/LoadingState'
import {
  getEventById,
  getEventRegistrationErrorMessage,
  getEventRegistrationStatus,
  markMyEventsShouldRefresh,
  registerEvent
} from '../../services/events'
import './index.scss'

export default function EventDetail() {
  const [eventId, setEventId] = useState('')
  const [joined, setJoined] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [ev, setEv] = useState<any>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useLoad((options) => {
    setEventId(String(options?.id || ''))
  })

  const loadData = useCallback(async () => {
    if (!eventId) return
    setLoading(true)
    setError('')
    try {
      const [detail, status] = await Promise.all([
        getEventById(eventId),
        getEventRegistrationStatus(eventId).catch(() => ({ registered: false }))
      ])
      setEv(detail)
      setJoined(status.registered)
      if (!detail) setError('活动不存在')
    } catch (err: any) {
      setError(err?.message || '活动加载失败')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleJoin = async () => {
    if (!ev) return
    if (joined) {
      Taro.showToast({ title: '你已经报名过该活动了', icon: 'none' })
      return
    }
    if (!ev.isRegisterable) {
      Taro.showToast({ title: '该活动为资讯内容，暂不支持报名', icon: 'none' })
      return
    }
    if (ev.status === 'ended') {
      Taro.showToast({ title: '活动已结束，无法报名', icon: 'none' })
      return
    }
    if (ev.registrationDeadline && Date.now() > ev.registrationDeadline) {
      Taro.showToast({ title: '报名已截止', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      await registerEvent(eventId)
      setJoined(true)
      markMyEventsShouldRefresh()
      Taro.showToast({ title: '报名成功', icon: 'success' })
    } catch (err: any) {
      Taro.showToast({ title: getEventRegistrationErrorMessage(err), icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState fullScreen text="活动加载中..." />
  if (error || !ev) return <EmptyState title="加载失败" description={error || '活动不存在'} actionText="重试" onAction={loadData} />

  const typeText = ev.eventType === 'official' ? '官方活动' : '活动资讯'
  const disabledReason = joined
    ? '你已报名该活动，可在“我的活动”中查看'
      : !ev.isRegisterable
      ? '该内容为活动资讯，暂不支持报名'
      : ev.status === 'ended'
        ? '活动已结束'
        : ev.registrationDeadline && Date.now() > ev.registrationDeadline
          ? '报名已截止'
          : ''
  const actionText = joined ? '已报名' : disabledReason ? '暂不可报名' : '立即报名'

  return (
    <View className="page-event-detail page-container">
      <View className="event-cover">
        <Image src={ev.coverUrl} mode="aspectFill" style={{ width: '100%', height: '100%' }} />
      </View>
      <View className="event-content">
        <Text className="event-title">{ev.title}</Text>
        <View className="event-meta">
          <Text>类型：{typeText}</Text>
          <Text>报名状态：{joined ? '已报名' : '未报名'}</Text>
          <Text>状态：{ev.statusText || '待定'}</Text>
          <Text>时间：{ev.time}</Text>
          <Text>地点：{ev.location}</Text>
          <Text>主办：{ev.organizer}</Text>
          <Text>名额：{ev.capacity || '未限制'}</Text>
          <Text>报名截止：{ev.registrationDeadlineText || '未设置'}</Text>
          <Text>费用：{ev.price || '免费'}</Text>
        </View>
        <Text className="event-desc">{ev.description || '暂无详情描述'}</Text>
        {disabledReason && (
          <Text style={{ marginTop: '16rpx', display: 'block', color: 'var(--color-text-secondary)' }}>
            {disabledReason}
          </Text>
        )}
      </View>
      <View className="event-footer">
        <PrimaryButton block disabled={!!disabledReason} loading={submitting} onClick={handleJoin}>
          {actionText}
        </PrimaryButton>
      </View>
    </View>
  )
}
