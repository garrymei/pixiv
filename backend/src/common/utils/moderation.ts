import { ModerationStatus } from '../../types/enums'

export type ModerationInput = {
  text?: string
  images?: string[]
}

export type ModerationResult = {
  status: ModerationStatus
  reason?: string
}

const SUSPECT_KEYWORDS = [
  'vx',
  '微信',
  '加v',
  '黄',
  '涉黄',
  '裸聊',
  '赌博',
  '博彩',
  '返利',
  '刷单',
  '兼职日结',
  '政治',
  '极端',
  '违禁'
]

const URL_PATTERN = /(https?:\/\/|www\.)/i

function normalize(value: string) {
  return value.toLowerCase()
}

export function autoModerate(input: ModerationInput): ModerationResult {
  const text = String(input.text || '')
  const imageList = input.images || []
  const merged = normalize(`${text} ${imageList.join(' ')}`)

  if (!merged.trim()) {
    return { status: ModerationStatus.APPROVED }
  }

  if (URL_PATTERN.test(merged)) {
    return { status: ModerationStatus.PENDING, reason: '包含外链，需人工复核' }
  }

  const hit = SUSPECT_KEYWORDS.find((keyword) => merged.includes(normalize(keyword)))
  if (hit) {
    return { status: ModerationStatus.PENDING, reason: `命中敏感词：${hit}` }
  }

  return { status: ModerationStatus.APPROVED }
}
