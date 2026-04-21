import { View, Text, Picker } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { Input } from '../../components/base/Input'
import { Textarea } from '../../components/base/Textarea'
import { Tag } from '../../components/base/Tag'
import { PrimaryButton } from '../../components/base/Button'
import { createDemand } from '../../services/demands'
import { useThemeMode } from '../../config/theme'
import './index.scss'

const DEMAND_TYPES = ['摄影', '妆娘', 'Coser', '后期', '找毛娘', '找妆娘', '找摄影', '本毛娘', '本妆娘', '本摄影', '找CP']
const BUDGETS = ['无偿', '互勉', '面议', '¥ 100-300', '¥ 300-500', '¥ 500+']
const COUNTS = ['1人', '2-3人', '4-6人', '6人以上']

export default function PublishDemand() {
  const [type, setType] = useState('')
  const [title, setTitle] = useState('')
  const { theme } = useThemeMode()
  
  useLoad((options) => {
    if (options.type && DEMAND_TYPES.includes(options.type)) {
      setType(options.type)
      setTitle(`【${options.type}】`)
    }
  })
  const [desc, setDesc] = useState('')
  const [timeDate, setTimeDate] = useState('')
  const [timeClock, setTimeClock] = useState('')
  const [deadlineDate, setDeadlineDate] = useState('')
  const [deadlineClock, setDeadlineClock] = useState('')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [count, setCount] = useState('')
  const [contact, setContact] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    const time = timeDate && timeClock ? `${timeDate}T${timeClock}:00` : ''
    const deadline = deadlineDate && deadlineClock ? `${deadlineDate}T${deadlineClock}:00` : ''
    const e: Record<string, string> = {}
    if (!type) e.type = '请选择需求类型'
    if (!title.trim()) e.title = '请输入标题'
    if (!desc.trim()) e.desc = '请输入描述'
    if (!time) e.time = '请选择预约时间'
    if (!deadline) e.deadline = '请选择报名截止时间'
    if (!location.trim()) e.location = '请输入地点'
    if (!budget) e.budget = '请选择预算'
    if (!count) e.count = '请选择人数'
    if (!contact.trim()) e.contact = '请填写联系说明'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setSubmitting(true)
    try {
      await createDemand({ type, title, desc: `${desc}\n联系方式：${contact}`, time, deadline, location, budget, count })
      Taro.showToast({ title: '已提交，审核通过后展示', icon: 'none' })
      setTimeout(() => Taro.navigateTo({ url: '/pages/my-demands/index' }), 300)
    } catch (err: any) {
      Taro.showToast({ title: err?.message || '发布失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className={`page-publish-demand page-container theme-${theme}`}>
      <View className="form-section">
        <Text>需求类型</Text>
        <View className="type-row">
          {DEMAND_TYPES.map((t) => (
            <View key={t} onClick={() => setType(t)}>
              <Tag type={type === t ? 'primary' : 'default'} outline={type !== t} size="medium">{t}</Tag>
            </View>
          ))}
        </View>
        {errors.type && <Text style={{ color: 'var(--color-error)' }}>{errors.type}</Text>}
      </View>
      <View className="form-section">
        <Input label="标题" value={title} onInput={(e) => setTitle((e.detail as any).value)} error={errors.title} placeholder="例如：急求周末外景摄影师" />
      </View>
      <View className="form-section">
        <Textarea label="描述" value={desc} onInput={(e) => setDesc((e.detail as any).value)} error={errors.desc} maxlength={300} showCount placeholder="简单描述需求细节" />
      </View>
      <View className="form-section">
        <Text>预约时间</Text>
        <View className="datetime-row">
          <Picker mode="date" value={timeDate} onChange={(e) => setTimeDate((e.detail as any).value)}>
            <Input label="日期" value={timeDate} disabled placeholder="选择日期" error={errors.time} />
          </Picker>
          <Picker mode="time" value={timeClock} onChange={(e) => setTimeClock((e.detail as any).value)}>
            <Input label="时间" value={timeClock} disabled placeholder="选择时间" />
          </Picker>
        </View>
      </View>
      <View className="form-section">
        <Text>报名截止</Text>
        <View className="datetime-row">
          <Picker mode="date" value={deadlineDate} onChange={(e) => setDeadlineDate((e.detail as any).value)}>
            <Input label="日期" value={deadlineDate} disabled placeholder="选择日期" error={errors.deadline} />
          </Picker>
          <Picker mode="time" value={deadlineClock} onChange={(e) => setDeadlineClock((e.detail as any).value)}>
            <Input label="时间" value={deadlineClock} disabled placeholder="选择时间" />
          </Picker>
        </View>
      </View>
      <View className="form-section">
        <Input label="地点" value={location} onInput={(e) => setLocation((e.detail as any).value)} error={errors.location} placeholder="例如：广州海珠区" />
      </View>
      <View className="form-section">
        <Text>预算类型</Text>
        <View className="budget-row">
          {BUDGETS.map((b) => (
            <View key={b} onClick={() => setBudget(b)}>
              <Tag type={budget === b ? 'primary' : 'default'} outline={budget !== b} size="medium">{b}</Tag>
            </View>
          ))}
        </View>
        {errors.budget && <Text style={{ color: 'var(--color-error)' }}>{errors.budget}</Text>}
      </View>
      <View className="form-section">
        <Text>人数限制</Text>
        <View className="count-row">
          {COUNTS.map((c) => (
            <View key={c} onClick={() => setCount(c)}>
              <Tag type={count === c ? 'primary' : 'default'} outline={count !== c} size="medium">{c}</Tag>
            </View>
          ))}
        </View>
        {errors.count && <Text style={{ color: 'var(--color-error)' }}>{errors.count}</Text>}
      </View>
      <View className="form-section">
        <Textarea label="联系说明" value={contact} onInput={(e) => setContact((e.detail as any).value)} error={errors.contact} maxlength={200} showCount placeholder="填写联系方式或私信说明" />
      </View>
      <PrimaryButton block loading={submitting} onClick={submit}>发布</PrimaryButton>
    </View>
  )
}
