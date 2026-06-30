import { View, Text, Image, Picker, Textarea } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import classNames from 'classnames'
import { useEffect, useMemo, useState } from 'react'
import { PrimaryButton } from '../../components/base/Button'
import { EmptyState } from '../../components/base/EmptyState'
import { LoadingState } from '../../components/base/LoadingState'
import { useThemeMode } from '../../config/theme'
import { createVenueBooking, listVenues, type Venue, type VenueScene } from '../../services/venues'
import { isGuestMode, promptLogin } from '../../services/request'
import './index.scss'

type TimeOption = {
  label: string
  value: number
}

function buildTimeOptions(): TimeOption[] {
  const now = new Date()
  now.setMinutes(now.getMinutes() + (30 - (now.getMinutes() % 30 || 30)))
  now.setSeconds(0, 0)
  const start = now.getTime()
  const end = Date.now() + 24 * 60 * 60 * 1000
  const list: TimeOption[] = []
  for (let value = start; value <= end; value += 30 * 60 * 1000) {
    list.push({
      value,
      label: new Date(value).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    })
  }
  return list
}

export default function VenuesPage() {
  const { theme } = useThemeMode()
  const [venues, setVenues] = useState<Venue[]>([])
  const [activeVenueId, setActiveVenueId] = useState<number | null>(null)
  const [activeSceneId, setActiveSceneId] = useState<number | null>(null)
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(1)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const timeOptions = useMemo(buildTimeOptions, [])
  const activeVenue = venues.find((item) => item.id === activeVenueId) || venues[0]
  const scenes = activeVenue?.scenes || []
  const activeScene = scenes.find((item) => item.id === activeSceneId) || scenes[0]
  const endOptions = timeOptions.filter((item) => item.value > (timeOptions[startIndex]?.value || 0))
  const safeEndIndex = Math.min(endIndex, Math.max(endOptions.length - 1, 0))

  const loadData = async () => {
    try {
      setLoading(true)
      const list = await listVenues()
      setVenues(list)
      if (list[0]) {
        setActiveVenueId((prev) => prev || list[0].id)
        setActiveSceneId((prev) => prev || list[0].scenes[0]?.id || null)
      }
    } catch (error: any) {
      Taro.showToast({ title: error?.message || '场地加载失败', icon: 'none' })
    } finally {
      setLoading(false)
      Taro.stopPullDownRefresh()
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  usePullDownRefresh(loadData)

  const selectVenue = (venue: Venue) => {
    setActiveVenueId(venue.id)
    setActiveSceneId(venue.scenes[0]?.id || null)
  }

  const selectScene = (scene: VenueScene) => {
    setActiveSceneId(scene.id)
  }

  const submit = async () => {
    if (isGuestMode()) {
      promptLogin('登录后才能预约场地')
      return
    }
    if (!activeScene) {
      Taro.showToast({ title: '请选择场景', icon: 'none' })
      return
    }
    const start = timeOptions[startIndex]?.value
    const end = endOptions[safeEndIndex]?.value
    if (!start || !end || end <= start) {
      Taro.showToast({ title: '请选择有效时段', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      await createVenueBooking({
        sceneId: activeScene.id,
        startTime: start,
        endTime: end,
        note: note.trim()
      })
      Taro.showToast({ title: '预约成功', icon: 'success' })
      setNote('')
    } catch (error: any) {
      Taro.showToast({ title: error?.message || '预约失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className={classNames('page-venues', 'page-container-full', `theme-${theme}`)}>
      <View className="page-venues__hero">
        <Text className="page-venues__eyebrow">VENUE BOOKING</Text>
        <Text className="page-venues__title">场地预约</Text>
        <Text className="page-venues__subtitle">选择场馆与场景，预约未来 24 小时内的可用时段。</Text>
      </View>

      {loading ? (
        <LoadingState text="场地加载中" />
      ) : venues.length === 0 ? (
        <EmptyState title="暂无可预约场地" description="后台配置场馆和场景后会展示在这里。" />
      ) : (
        <View className="page-venues__content">
          <View className="page-venues__venue-tabs">
            {venues.map((venue) => (
              <View
                key={venue.id}
                className={classNames('page-venues__venue-tab', {
                  'page-venues__venue-tab--active': activeVenue?.id === venue.id
                })}
                onClick={() => selectVenue(venue)}
              >
                <Text>{venue.name}</Text>
              </View>
            ))}
          </View>

          <View className="page-venues__scene-list">
            {scenes.map((scene) => (
              <View
                key={scene.id}
                className={classNames('page-venues__scene-card', {
                  'page-venues__scene-card--active': activeScene?.id === scene.id
                })}
                onClick={() => selectScene(scene)}
              >
                {scene.imageUrl ? <Image className="page-venues__scene-image" src={scene.imageUrl} mode="aspectFill" /> : null}
                <View className="page-venues__scene-body">
                  <Text className="page-venues__scene-name">{scene.name}</Text>
                  <Text className="page-venues__scene-desc">{scene.description || activeVenue?.address || '可预约场景'}</Text>
                  {scene.capacity ? <Text className="page-venues__scene-meta">建议人数：{scene.capacity}</Text> : null}
                </View>
              </View>
            ))}
          </View>

          <View className="page-venues__booking-panel">
            <Text className="page-venues__panel-title">选择预约时段</Text>
            <View className="page-venues__time-row">
              <Picker mode="selector" range={timeOptions.map((item) => item.label)} value={startIndex} onChange={(e) => { setStartIndex(Number((e.detail as any).value)); setEndIndex(0) }}>
                <View className="page-venues__time-field">
                  <Text className="page-venues__time-label">开始</Text>
                  <Text className="page-venues__time-value">{timeOptions[startIndex]?.label || '请选择'}</Text>
                </View>
              </Picker>
              <Picker mode="selector" range={endOptions.map((item) => item.label)} value={safeEndIndex} onChange={(e) => setEndIndex(Number((e.detail as any).value))}>
                <View className="page-venues__time-field">
                  <Text className="page-venues__time-label">结束</Text>
                  <Text className="page-venues__time-value">{endOptions[safeEndIndex]?.label || '请选择'}</Text>
                </View>
              </Picker>
            </View>

            <Textarea
              className="page-venues__note"
              value={note}
              maxlength={120}
              placeholder="备注，可填写人数、用途或到场说明"
              onInput={(e) => setNote((e.detail as any).value)}
            />

            <PrimaryButton block loading={submitting} disabled={!activeScene || submitting} onClick={submit}>
              预约场地
            </PrimaryButton>
          </View>
        </View>
      )}
    </View>
  )
}
