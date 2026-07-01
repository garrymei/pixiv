import { View, Text, Image, Picker, Textarea } from '@tarojs/components'
import Taro, { useLoad, usePullDownRefresh } from '@tarojs/taro'
import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PrimaryButton } from '../../components/base/Button'
import { EmptyState } from '../../components/base/EmptyState'
import { LoadingState } from '../../components/base/LoadingState'
import { useThemeMode } from '../../config/theme'
import {
  createVenueBooking,
  getSceneAvailability,
  listVenues,
  type Venue,
  type VenueBookingSlot,
  type VenueScene
} from '../../services/venues'
import { isGuestMode, promptLogin } from '../../services/request'
import { markMyEventsShouldRefresh } from '../../services/events'
import './index.scss'

type TimeOption = {
  label: string
  value: number
}

const HALF_HOUR_MS = 30 * 60 * 1000

function formatTimeLabel(value: number) {
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

function buildTimeOptions(windowStart: number, windowEnd: number): TimeOption[] {
  const start = Math.ceil(windowStart / HALF_HOUR_MS) * HALF_HOUR_MS
  const list: TimeOption[] = []
  for (let value = start; value <= windowEnd; value += HALF_HOUR_MS) {
    list.push({
      value,
      label: formatTimeLabel(value)
    })
  }
  return list
}

function createDefaultWindow() {
  const now = Date.now()
  return {
    start: now,
    end: now + 24 * 60 * 60 * 1000
  }
}

function hasConflict(bookings: VenueBookingSlot[], start: number, end: number) {
  return bookings.some((item) => item.status === 'CONFIRMED' && item.startTime < end && item.endTime > start)
}

function formatBookingRange(startTime: number, endTime: number) {
  return `${formatTimeLabel(startTime)} - ${new Date(endTime).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })}`
}

export default function VenuesPage() {
  const { theme } = useThemeMode()
  const [venues, setVenues] = useState<Venue[]>([])
  const [activeVenueId, setActiveVenueId] = useState<number | null>(null)
  const [activeSceneId, setActiveSceneId] = useState<number | null>(null)
  const [startValue, setStartValue] = useState<number | null>(null)
  const [endValue, setEndValue] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [bookedSlots, setBookedSlots] = useState<VenueBookingSlot[]>([])
  const [availabilityWindow, setAvailabilityWindow] = useState(createDefaultWindow())
  const [preferredVenueId, setPreferredVenueId] = useState<number | null>(null)
  const [preferredSceneId, setPreferredSceneId] = useState<number | null>(null)

  const activeVenue = venues.find((item) => item.id === activeVenueId) || venues[0]
  const scenes = activeVenue?.scenes || []
  const activeScene = scenes.find((item) => item.id === activeSceneId) || scenes[0]
  const timeOptions = useMemo(
    () => buildTimeOptions(availabilityWindow.start, availabilityWindow.end),
    [availabilityWindow.end, availabilityWindow.start]
  )

  const canBookRange = useCallback(
    (start: number, end: number) => end > start && !hasConflict(bookedSlots, start, end),
    [bookedSlots]
  )

  const availableStartOptions = useMemo(
    () =>
      timeOptions.filter((option) =>
        timeOptions.some((candidate) => candidate.value > option.value && canBookRange(option.value, candidate.value))
      ),
    [canBookRange, timeOptions]
  )

  const availableEndOptions = useMemo(() => {
    if (!startValue) return []
    return timeOptions.filter((option) => option.value > startValue && canBookRange(startValue, option.value))
  }, [canBookRange, startValue, timeOptions])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const list = await listVenues()
      setVenues(list)
      if (list[0]) {
        setActiveVenueId((prev) => {
          if (prev && list.some((item) => item.id === prev)) return prev
          if (preferredVenueId && list.some((item) => item.id === preferredVenueId)) return preferredVenueId
          return list[0].id
        })
        setActiveSceneId((prev) => {
          const flatScenes = list.flatMap((item) => item.scenes || [])
          return prev && flatScenes.some((item) => item.id === prev) ? prev : list[0].scenes[0]?.id || null
        })
      } else {
        setActiveVenueId(null)
        setActiveSceneId(null)
      }
    } catch (error: any) {
      Taro.showToast({ title: error?.message || '场地加载失败', icon: 'none' })
    } finally {
      setLoading(false)
      Taro.stopPullDownRefresh()
    }
  }, [preferredVenueId])

  const loadAvailability = useCallback(async (sceneId: number) => {
    try {
      setAvailabilityLoading(true)
      const data = await getSceneAvailability(sceneId)
      setBookedSlots(data.bookings)
      setAvailabilityWindow({
        start: data.windowStart || createDefaultWindow().start,
        end: data.windowEnd || createDefaultWindow().end
      })
    } catch (error: any) {
      setBookedSlots([])
      setAvailabilityWindow(createDefaultWindow())
      Taro.showToast({ title: error?.message || '加载预约时段失败', icon: 'none' })
    } finally {
      setAvailabilityLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  usePullDownRefresh(loadData)

  useLoad((options) => {
    const nextVenueId = Number(options?.venueId || 0)
    const nextSceneId = Number(options?.sceneId || 0)
    setPreferredVenueId(nextVenueId > 0 ? nextVenueId : null)
    setPreferredSceneId(nextSceneId > 0 ? nextSceneId : null)
  })

  useEffect(() => {
    if (!activeSceneId) {
      setBookedSlots([])
      setAvailabilityWindow(createDefaultWindow())
      return
    }
    loadAvailability(activeSceneId)
  }, [activeSceneId, loadAvailability])

  useEffect(() => {
    if (!preferredSceneId || venues.length === 0) return
    const matchedVenue = venues.find((venue) => venue.id === (preferredVenueId || venue.id))
      || venues.find((venue) => (venue.scenes || []).some((scene) => scene.id === preferredSceneId))
    const matchedScene = matchedVenue?.scenes?.find((scene) => scene.id === preferredSceneId)
    if (matchedVenue?.id) setActiveVenueId(matchedVenue.id)
    if (matchedScene?.id) setActiveSceneId(matchedScene.id)
  }, [preferredSceneId, preferredVenueId, venues])

  useEffect(() => {
    const nextStartValue = availableStartOptions.some((item) => item.value === startValue)
      ? startValue
      : (availableStartOptions[0]?.value ?? null)

    if (nextStartValue !== startValue) {
      setStartValue(nextStartValue)
      return
    }

    const nextEndOptions = nextStartValue
      ? timeOptions.filter((item) => item.value > nextStartValue && canBookRange(nextStartValue, item.value))
      : []
    const nextEndValue = nextEndOptions.some((item) => item.value === endValue)
      ? endValue
      : (nextEndOptions[0]?.value ?? null)

    if (nextEndValue !== endValue) {
      setEndValue(nextEndValue)
    }
  }, [availableStartOptions, canBookRange, endValue, startValue, timeOptions])

  const selectVenue = (venue: Venue) => {
    setActiveVenueId(venue.id)
    setActiveSceneId(venue.scenes[0]?.id || null)
  }

  const selectScene = (scene: VenueScene) => {
    setActiveSceneId(scene.id)
  }

  const handleStartChange = (value: number) => {
    setStartValue(value)
    const nextEnd = timeOptions.find((item) => item.value > value && canBookRange(value, item.value))
    setEndValue(nextEnd?.value || null)
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
    if (!startValue || !endValue || !canBookRange(startValue, endValue)) {
      Taro.showToast({ title: '请选择有效时段', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      await createVenueBooking({
        sceneId: activeScene.id,
        startTime: startValue,
        endTime: endValue,
        note: note.trim()
      })
      Taro.showToast({ title: '预约成功', icon: 'success' })
      markMyEventsShouldRefresh()
      setNote('')
      await loadAvailability(activeScene.id)
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
        <Text className="page-venues__subtitle">场地与场景由平台统一配置，用户只能预约未来 24 小时内的可用时段，不能自行发布场地。</Text>
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
            <Text className="page-venues__panel-tip">
              {activeVenue?.name || '当前场馆'} {activeVenue?.address ? `· ${activeVenue.address}` : ''}
            </Text>

            {availabilityLoading ? (
              <Text className="page-venues__availability-tip">正在加载该场景的可预约时段...</Text>
            ) : bookedSlots.length > 0 ? (
              <View className="page-venues__occupied-list">
                <Text className="page-venues__occupied-title">已占用时段</Text>
                <View className="page-venues__occupied-tags">
                  {bookedSlots.map((item) => (
                    <View key={item.id} className="page-venues__occupied-tag">
                      <Text>{formatBookingRange(item.startTime, item.endTime)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text className="page-venues__availability-tip">未来 24 小时内暂无已占用时段，可直接预约。</Text>
            )}

            {availableStartOptions.length === 0 ? (
              <View className="page-venues__no-slot">
                <Text className="page-venues__no-slot-title">当前场景未来 24 小时已约满</Text>
                <Text className="page-venues__no-slot-desc">请切换其他场景，或等待后台放出新的可预约时段。</Text>
              </View>
            ) : (
              <View className="page-venues__time-row">
                <Picker
                  mode="selector"
                  range={availableStartOptions.map((item) => item.label)}
                  value={Math.max(
                    availableStartOptions.findIndex((item) => item.value === startValue),
                    0
                  )}
                  onChange={(e) => handleStartChange(availableStartOptions[Number((e.detail as any).value)]?.value)}
                >
                  <View className="page-venues__time-field">
                    <Text className="page-venues__time-label">开始</Text>
                    <Text className="page-venues__time-value">
                      {availableStartOptions.find((item) => item.value === startValue)?.label || '请选择'}
                    </Text>
                  </View>
                </Picker>
                <Picker
                  mode="selector"
                  range={availableEndOptions.map((item) => item.label)}
                  value={Math.max(
                    availableEndOptions.findIndex((item) => item.value === endValue),
                    0
                  )}
                  onChange={(e) => setEndValue(availableEndOptions[Number((e.detail as any).value)]?.value || null)}
                >
                  <View className="page-venues__time-field">
                    <Text className="page-venues__time-label">结束</Text>
                    <Text className="page-venues__time-value">
                      {availableEndOptions.find((item) => item.value === endValue)?.label || '请选择'}
                    </Text>
                  </View>
                </Picker>
              </View>
            )}

            <Textarea
              className="page-venues__note"
              value={note}
              maxlength={120}
              placeholder="备注，可填写人数、用途或到场说明"
              onInput={(e) => setNote((e.detail as any).value)}
            />

            <PrimaryButton
              block
              loading={submitting}
              disabled={!activeScene || submitting || availabilityLoading || !startValue || !endValue}
              onClick={submit}
            >
              预约场地
            </PrimaryButton>
          </View>
        </View>
      )}
    </View>
  )
}
