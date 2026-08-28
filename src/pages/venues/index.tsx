import { View, Text, Image, Input, Picker, Swiper, SwiperItem, Textarea } from '@tarojs/components'
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
import yueciyuanLogo from '../../assets/venues/yueciyuan-logo.jpg'
import './index.scss'

type TimeOption = {
  label: string
  value: number
}

const HALF_HOUR_MS = 30 * 60 * 1000
const PEOPLE_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1)
const EXAMPLE_PLACEHOLDERS = ['全身构图', '半身人像', '氛围特写']
const CLASSROOM_IMAGES = [
  'https://www.pivix.top/uploads/venues/yueciyuan/classroom-1.jpg',
  'https://www.pivix.top/uploads/venues/yueciyuan/classroom-2.jpg'
]

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

function formatSlotTime(value: number) {
  return new Date(value).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

function formatSlotDate(value: number) {
  const date = new Date(value)
  const today = new Date()
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  if (day.getTime() === new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) return '今天'
  if (day.getTime() === tomorrow.getTime()) return '明天'
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export default function VenuesPage() {
  const { theme } = useThemeMode()
  const [venues, setVenues] = useState<Venue[]>([])
  const [activeVenueId, setActiveVenueId] = useState<number | null>(null)
  const [activeSceneId, setActiveSceneId] = useState<number | null>(null)
  const [startValue, setStartValue] = useState<number | null>(null)
  const [endValue, setEndValue] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [peopleCount, setPeopleCount] = useState(1)
  const [phone, setPhone] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const [currentSceneImage, setCurrentSceneImage] = useState(0)
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
  const activeSceneImages = useMemo(() => {
    if (activeVenue?.name === '粤次元摄影棚' && activeScene?.name === '校园') {
      return CLASSROOM_IMAGES
    }
    return activeScene?.imageUrl ? [activeScene.imageUrl] : []
  }, [activeScene?.imageUrl, activeScene?.name, activeVenue?.name])
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

  const slotOptions = useMemo(() => timeOptions.slice(0, -1), [timeOptions])
  const slotGroups = useMemo(() => {
    return slotOptions.reduce<Array<{ label: string; slots: TimeOption[] }>>((groups, slot) => {
      const label = formatSlotDate(slot.value)
      const current = groups[groups.length - 1]
      if (current?.label === label) current.slots.push(slot)
      else groups.push({ label, slots: [slot] })
      return groups
    }, [])
  }, [slotOptions])

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
      setStartValue(null)
      setEndValue(null)
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
    setCurrentSceneImage(0)
  }, [activeSceneId])

  useEffect(() => {
    if (!preferredSceneId || venues.length === 0) return
    const matchedVenue = venues.find((venue) => venue.id === (preferredVenueId || venue.id))
      || venues.find((venue) => (venue.scenes || []).some((scene) => scene.id === preferredSceneId))
    const matchedScene = matchedVenue?.scenes?.find((scene) => scene.id === preferredSceneId)
    if (matchedVenue?.id) setActiveVenueId(matchedVenue.id)
    if (matchedScene?.id) setActiveSceneId(matchedScene.id)
  }, [preferredSceneId, preferredVenueId, venues])

  const selectVenue = (venue: Venue) => {
    setActiveVenueId(venue.id)
    setActiveSceneId(venue.scenes[0]?.id || null)
  }

  const selectScene = (scene: VenueScene) => {
    setActiveSceneId(scene.id)
  }

  const handleSlotClick = (value: number) => {
    const slotEnd = value + HALF_HOUR_MS
    if (!canBookRange(value, slotEnd)) return
    if (!startValue || (startValue && endValue) || value <= startValue) {
      setStartValue(value)
      setEndValue(null)
      return
    }
    if (!canBookRange(startValue, slotEnd)) {
      setStartValue(value)
      setEndValue(null)
      Taro.showToast({ title: '预约区间不能包含已占用时段', icon: 'none' })
      return
    }
    setEndValue(slotEnd)
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
    const normalizedPhone = phone.trim()
    if (!/^1[3-9]\d{9}$/.test(normalizedPhone)) {
      Taro.showToast({ title: '请填写正确的11位手机号', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      await createVenueBooking({
        sceneId: activeScene.id,
        startTime: startValue,
        endTime: endValue,
        note: [`联系电话：${normalizedPhone}`, `预约人数：${peopleCount}人`, note.trim()].filter(Boolean).join('；')
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

          <View className="page-venues__venue-detail">
            <View className="page-venues__venue-heading">
              <View className="page-venues__venue-identity">
                {activeVenue?.name === '粤次元摄影棚' ? (
                  <Image className="page-venues__venue-logo" src={yueciyuanLogo} mode="aspectFill" />
                ) : null}
                <View className="page-venues__venue-copy">
                  <Text className="page-venues__venue-name">{activeVenue?.name}</Text>
                  <Text className="page-venues__venue-address">{activeVenue?.address || activeVenue?.city || '地址待补充'}</Text>
                </View>
              </View>
              <Text className="page-venues__venue-badge">摄影棚</Text>
            </View>

            <View className="page-venues__scene-hero">
              {activeSceneImages.length > 0 ? (
                <Swiper
                  className="page-venues__scene-swiper"
                  current={currentSceneImage}
                  circular={activeSceneImages.length > 1}
                  onChange={(event) => setCurrentSceneImage(Number((event.detail as any).current || 0))}
                >
                  {activeSceneImages.map((imageUrl, index) => (
                    <SwiperItem key={`${activeScene?.id || 0}-${index}`}>
                      <Image className="page-venues__scene-hero-image" src={imageUrl} mode="aspectFill" />
                    </SwiperItem>
                  ))}
                </Swiper>
              ) : (
                <View className="page-venues__image-placeholder">
                  <Text className="page-venues__image-placeholder-icon">＋</Text>
                  <Text className="page-venues__image-placeholder-title">{activeScene?.name || '棚景'}图片</Text>
                  <Text className="page-venues__image-placeholder-tip">预留棚景主图位置 · 建议 16:9</Text>
                </View>
              )}
              <View className="page-venues__scene-caption">
                <Text className="page-venues__scene-caption-name">{activeScene?.name || '请选择棚景'}</Text>
                <Text className="page-venues__scene-caption-desc">{activeScene?.description || '棚景介绍待补充'}</Text>
              </View>
              {activeSceneImages.length > 1 ? (
                <View className="page-venues__scene-pagination">
                  <Text>{currentSceneImage + 1} / {activeSceneImages.length}</Text>
                </View>
              ) : null}
            </View>

            <Picker
              mode="selector"
              range={scenes.map((scene) => scene.name)}
              value={Math.max(scenes.findIndex((scene) => scene.id === activeScene?.id), 0)}
              onChange={(e) => {
                const scene = scenes[Number((e.detail as any).value)]
                if (scene) selectScene(scene)
              }}
            >
              <View className="page-venues__selector-field">
                <View>
                  <Text className="page-venues__selector-label">选择棚景</Text>
                  <Text className="page-venues__selector-value">{activeScene?.name || '请选择'}</Text>
                </View>
                <Text className="page-venues__selector-arrow">⌄</Text>
              </View>
            </Picker>
          </View>

          <View className="page-venues__booking-panel">
            <Text className="page-venues__panel-title">预约信息</Text>
            <Text className="page-venues__panel-tip">
              {activeVenue?.name || '当前场馆'} {activeVenue?.address ? `· ${activeVenue.address}` : ''}
            </Text>

            <Picker
              mode="selector"
              range={PEOPLE_OPTIONS.map((value) => `${value} 人`)}
              value={Math.max(PEOPLE_OPTIONS.indexOf(peopleCount), 0)}
              onChange={(e) => setPeopleCount(PEOPLE_OPTIONS[Number((e.detail as any).value)] || 1)}
            >
              <View className="page-venues__selector-field">
                <View>
                  <Text className="page-venues__selector-label">预约人数</Text>
                  <Text className="page-venues__selector-value">{peopleCount} 人</Text>
                </View>
                <Text className="page-venues__selector-arrow">⌄</Text>
              </View>
            </Picker>

            <Text className="page-venues__field-heading">选择预约时间</Text>

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
              <View className="page-venues__slot-picker">
                <Text className="page-venues__slot-instruction">
                  {!startValue || endValue ? '点击一个可用时段作为开始时间' : '继续点击结束时段，组成预约区间'}
                </Text>
                {slotGroups.map((group) => (
                  <View key={group.label} className="page-venues__slot-group">
                    <Text className="page-venues__slot-date">{group.label}</Text>
                    <View className="page-venues__slot-grid">
                      {group.slots.map((slot) => {
                        const occupied = !canBookRange(slot.value, slot.value + HALF_HOUR_MS)
                        const selected = Boolean(startValue && slot.value >= startValue && endValue && slot.value < endValue)
                        const isStart = slot.value === startValue
                        return (
                          <View
                            key={slot.value}
                            className={classNames('page-venues__slot', {
                              'page-venues__slot--occupied': occupied,
                              'page-venues__slot--selected': selected || isStart
                            })}
                            onClick={() => handleSlotClick(slot.value)}
                          >
                            <Text>{formatSlotTime(slot.value)}</Text>
                            <Text className="page-venues__slot-state">{occupied ? '已预约' : isStart && !endValue ? '起点' : selected ? '已选择' : '可预约'}</Text>
                          </View>
                        )
                      })}
                    </View>
                  </View>
                ))}
                <View className="page-venues__selected-range">
                  <Text className="page-venues__selected-range-label">已选时间</Text>
                  <Text className="page-venues__selected-range-value">
                    {startValue ? formatTimeLabel(startValue) : '请选择开始时间'}
                    {endValue ? ` 至 ${formatTimeLabel(endValue)}` : startValue ? '（请选择结束时间）' : ''}
                  </Text>
                </View>
              </View>
            )}

            <View className="page-venues__phone-field">
              <Text className="page-venues__selector-label">联系电话 *</Text>
              <Input
                className="page-venues__phone-input"
                type="number"
                maxlength={11}
                value={phone}
                placeholder="请输入11位手机号"
                onInput={(event) => setPhone(String((event.detail as any).value || '').replace(/\D/g, '').slice(0, 11))}
              />
              <Text className="page-venues__phone-tip">用于场地方确认预约，仅随本次预约保存</Text>
            </View>

            <Textarea
              className="page-venues__note"
              value={note}
              maxlength={120}
              placeholder="备注，可填写人数、用途或到场说明"
              onInput={(e) => setNote((e.detail as any).value)}
            />

            <View className="page-venues__example-button" onClick={() => setShowExamples(true)}>
              <Text>查看例图</Text>
            </View>

            <PrimaryButton
              block
              loading={submitting}
              disabled={!activeScene || submitting || availabilityLoading || !startValue || !endValue || !/^1[3-9]\d{9}$/.test(phone.trim())}
              onClick={submit}
            >
              预约场地
            </PrimaryButton>
          </View>
        </View>
      )}

      {showExamples ? (
        <View className="page-venues__examples-mask" onClick={() => setShowExamples(false)}>
          <View className="page-venues__examples-modal" onClick={(event) => event.stopPropagation()}>
            <View className="page-venues__examples-head">
              <View>
                <Text className="page-venues__examples-title">{activeScene?.name || '棚景'}拍摄例图</Text>
                <Text className="page-venues__examples-subtitle">其他模特在当前棚景的拍摄效果</Text>
              </View>
              <Text className="page-venues__examples-close" onClick={() => setShowExamples(false)}>×</Text>
            </View>
            <View className="page-venues__examples-grid">
              {EXAMPLE_PLACEHOLDERS.map((label, index) => (
                <View key={label} className="page-venues__example-placeholder">
                  <Text className="page-venues__example-index">0{index + 1}</Text>
                  <Text className="page-venues__example-label">{label}</Text>
                  <Text className="page-venues__example-tip">预留模特例图</Text>
                </View>
              ))}
            </View>
            <View className="page-venues__examples-done" onClick={() => setShowExamples(false)}>
              <Text>返回预约</Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  )
}
