import { View, Text, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useCallback, useEffect, useState } from 'react'
import { Tag } from '../../components/base/Tag'
import { Button } from '../../components/base/Button'
import { EmptyState } from '../../components/base/EmptyState'
import { LoadingState } from '../../components/base/LoadingState'
import {
  applyDemand,
  confirmDemandAgreementCancel,
  confirmDemandSchedule,
  getDemandApplicationStatus,
  getDemandById,
  listDemandApplicationsByDemand,
  markMyAppliedDemandsShouldRefresh,
  requestDemandAgreementCancel
} from '../../services/demands'
import { useThemeMode } from '../../config/theme'
import './index.scss'

function getApplyErrorMessage(error: any) {
  const message = String(error?.message || '')
  if (message === 'already applied') return '你已经申请过该需求了'
  if (message === 'already accepted') return '该需求已接受其他人，暂不能申请'
  if (message === 'application_id required') return '请先在申请列表中选择要接受的人'
  if (message === 'deadline passed') return '该需求已截止报名'
  if (message === 'full') return '该需求名额已满'
  if (message === 'closed') return '该需求已关闭'
  if (message === 'event ended') return '该需求已过约定时间'
  if (message === 'not accepted yet') return '发布方尚未接受你的申请'
  if (message === 'agreement locked, cancel agreement first') return '当前已确认约定，请先双方取消约定再修改'
  if (message === 'demand not found') return '需求不存在或已下线'
  return message || '申请失败'
}

export default function DemandDetail() {
  const [id, setId] = useState('')
  const [marketMain, setMarketMain] = useState<'seek' | 'offer' | ''>('')
  const [demand, setDemand] = useState<any>()
  const [applied, setApplied] = useState(false)
  const [applyStatus, setApplyStatus] = useState<any>({})
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { theme } = useThemeMode()

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
      const [detail, rawStatus] = await Promise.all([
        getDemandById(id),
        getDemandApplicationStatus(id).catch(() => ({ applied: false, can_confirm: false }))
      ])
      const status: any = rawStatus || {}
      setDemand(detail)
      setApplied(status.applied)
      setApplyStatus(status)
      if (status?.role === 'publisher' || status?.has_applicants) {
        const appResult = await listDemandApplicationsByDemand(id).catch(() => ({ list: [] }))
        setApplications(appResult.list || [])
      } else {
        setApplications([])
      }
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
    if (applyStatus?.can_apply === false) {
      const text = applyStatus?.apply_disabled_reason === 'already accepted' ? '该需求已接受其他人' : '当前不可申请'
      Taro.showToast({ title: text, icon: 'none' })
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
      setApplyStatus((prev: any) => ({
        ...(prev || {}),
        applied: true,
        role: 'applicant',
        can_confirm: false,
        applicant_confirmed: false,
        publisher_confirmed: false,
        schedule_status: 'pending_confirm',
        schedule_status_text: '待确认'
      }))
      markMyAppliedDemandsShouldRefresh()
      Taro.showToast({ title: '已申请', icon: 'success' })
    } catch (err: any) {
      Taro.showToast({ title: getApplyErrorMessage(err), icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirm = async () => {
    if (!demand || !applyStatus?.can_confirm) return
    setSubmitting(true)
    try {
      const result = await confirmDemandSchedule(id, applyStatus?.application_id)
      markMyAppliedDemandsShouldRefresh()
      setApplyStatus((prev: any) => ({
        ...(prev || {}),
        application_id: result.application_id || prev?.application_id,
        can_confirm: false,
        applicant_confirmed: result.role === 'applicant' ? true : !!prev?.applicant_confirmed,
        publisher_confirmed: result.role === 'publisher' ? true : !!prev?.publisher_confirmed,
        schedule_status: result.schedule_status,
        schedule_status_text: result.schedule_status_text
      }))
      Taro.showToast({ title: '确认成功', icon: 'success' })
    } catch (err: any) {
      Taro.showToast({ title: err?.message || '确认失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestCancel = async () => {
    if (!demand || !applyStatus?.can_request_cancel) return
    setSubmitting(true)
    try {
      const result = await requestDemandAgreementCancel(id)
      markMyAppliedDemandsShouldRefresh()
      setApplyStatus((prev: any) => ({
        ...(prev || {}),
        can_request_cancel: false,
        can_confirm_cancel: false,
        schedule_status: result.schedule_status,
        schedule_status_text: result.schedule_status_text
      }))
      Taro.showToast({ title: '已发起取消约定，请对方确认', icon: 'success' })
    } catch (err: any) {
      Taro.showToast({ title: getApplyErrorMessage(err), icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmCancel = async () => {
    if (!demand || !applyStatus?.can_confirm_cancel) return
    setSubmitting(true)
    try {
      const result = await confirmDemandAgreementCancel(id)
      markMyAppliedDemandsShouldRefresh()
      setApplyStatus((prev: any) => ({
        ...(prev || {}),
        can_confirm_cancel: false,
        can_request_cancel: false,
        schedule_status: result.schedule_status,
        schedule_status_text: result.schedule_status_text
      }))
      Taro.showToast({ title: result.cancelled ? '已取消约定，可调整信息' : '已确认', icon: 'success' })
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
  const scheduleStatusText = applyStatus?.schedule_status_text || demand.scheduleStatusText
  const canConfirm = !!applyStatus?.can_confirm
  const canRequestCancel = !!applyStatus?.can_request_cancel
  const canConfirmCancel = !!applyStatus?.can_confirm_cancel
  const isPublisherRole = applyStatus?.role === 'publisher'
  const applyButtonDisabled =
    applied || applyStatus?.can_apply === false || demand.status === 'closed' || !!(demand.deadline && Date.now() > demand.deadline)
  const applyButtonText =
    applied
      ? '已申请'
      : applyStatus?.can_apply === false
      ? '已接受他人'
      : demand.status === 'closed'
      ? '已关闭'
      : demand.deadline && Date.now() > demand.deadline
      ? '已截止'
      : '感兴趣'
  const primaryActionText =
    canConfirm && !isPublisherRole
      ? '最终确认'
      : canConfirm && isPublisherRole
      ? '请在申请列表中选择接受'
      : applyButtonText
  const primaryActionClick = canConfirm && !isPublisherRole ? handleConfirm : handleApply
  const canUsePrimaryButton = canConfirm ? !isPublisherRole : true

  return (
    <View className={`page-demand-detail page-container theme-${theme}`} style={{ paddingBottom: 'var(--safe-area-bottom)' }}>
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
          <Text>状态：{scheduleStatusText || demand.statusText || (demand.status === 'closed' ? '已关闭' : '招募中')}</Text>
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
            type={canConfirm || canRequestCancel || canConfirmCancel ? 'primary' : applyButtonDisabled ? 'secondary' : 'primary'}
            loading={submitting}
            disabled={canConfirmCancel || canRequestCancel ? false : canUsePrimaryButton ? applyButtonDisabled : true}
            onClick={
              canConfirmCancel
                ? handleConfirmCancel
                : canRequestCancel
                ? handleRequestCancel
                : primaryActionClick
            }
          >
            {canConfirmCancel ? '同意取消约定' : canRequestCancel ? '取掉约定（待对方确认）' : primaryActionText}
          </Button>
        </View>
        {isPublisherRole && applications.length > 0 && (
          <View style={{ marginTop: '24rpx' }}>
            <Text style={{ color: 'var(--color-text-primary)', fontSize: '30rpx', fontWeight: 600 }}>申请人列表</Text>
            {applications.map((item) => {
              const canAcceptThis = !!applyStatus?.can_confirm && item.schedule_status === 'pending_confirm'
              const isAccepted = demand.acceptedApplicationId === item.application_id
              return (
                <View
                  key={item.application_id}
                  style={{
                    marginTop: '16rpx',
                    padding: '20rpx',
                    borderRadius: '16rpx',
                    background: 'var(--color-bg-card)',
                    border: isAccepted ? '2rpx solid var(--color-primary)' : '2rpx solid transparent'
                  }}
                >
                  <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx' }}>
                    <View style={{ width: '56rpx', height: '56rpx', borderRadius: '50%', overflow: 'hidden', background: 'var(--color-bg-secondary)' }}>
                      <Image src={item.user?.avatar || ''} mode="aspectFill" style={{ width: '100%', height: '100%' }} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: 'var(--color-text-primary)' }}>{item.user?.nickname || `用户${item.user_id}`}</Text>
                      <View>
                        <Text style={{ color: 'var(--color-text-secondary)', fontSize: '24rpx' }}>{item.schedule_status_text}</Text>
                      </View>
                    </View>
                    <Button
                      size="small"
                      type={isAccepted ? 'secondary' : 'primary'}
                      loading={submitting}
                      disabled={!canAcceptThis || isAccepted}
                      onClick={async () => {
                        if (!canAcceptThis || isAccepted || submitting) return
                        setSubmitting(true)
                        try {
                          await confirmDemandSchedule(id, item.application_id)
                          markMyAppliedDemandsShouldRefresh()
                          Taro.showToast({ title: '已接受该申请人', icon: 'success' })
                          await loadData()
                        } catch (err: any) {
                          Taro.showToast({ title: getApplyErrorMessage(err), icon: 'none' })
                        } finally {
                          setSubmitting(false)
                        }
                      }}
                    >
                      {isAccepted ? '已接受' : '接受'}
                    </Button>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </View>
    </View>
  )
}
