import { ConflictException, Injectable } from '@nestjs/common'
import { CreateDemandDto } from './dto/create-demand.dto'
import { DemandType, DemandStatus, ModerationStatus } from '../../types/enums'
import { getStoredUserSummary } from '../users/users.service'
import { autoModerate } from '../../common/utils/moderation'
import {
  getDemandApplicationSnapshot,
  hasBlockingConfirmedAgreement,
  mapScheduleStatusText,
  resolveScheduleStatusByHour
} from '../demand-application/demand-application.service'

type DemandItem = {
  id: number
  authorId: number
  accepted_application_id?: number | null
  accepted_user_id?: number | null
  demand_type: DemandType
  title: string
  description?: string
  city?: string
  location?: string
  event_time?: number
  budget_type?: string
  budget_amount?: number
  participant_limit?: number
  deadline?: number
  status: DemandStatus
  moderation_status: ModerationStatus
  moderation_reason?: string
  created_at: number
}

type DemandResponse = {
  id: number
  author_id: number
  accepted_application_id: number | null
  accepted_user_id: number | null
  demand_type: DemandType
  title: string
  description: string
  city: string
  location: string
  event_time: number | null
  budget_type: string | null
  budget_amount: number | null
  participant_limit: number | null
  deadline: number | null
  status: DemandStatus
  moderation_status: ModerationStatus
  moderation_reason: string
  created_at: number
  application_count: number
  schedule_status: 'pending_confirm' | 'confirmed' | 'ongoing' | 'ended'
  schedule_status_text: string
  user: {
    id: number
    nickname: string
    avatar: string
  }
}

let seq = 400
const DEMAND_SUBMISSION_TTL = 5000
const recentDemandSubmissions = new Map<string, number>()
const demands: DemandItem[] = [
  {
    id: 1,
    authorId: 1002,
    demand_type: DemandType.PHOTOGRAPHY,
    title: '求一个周末有空的摄影师，拍原神申鹤外景，包车马费和午餐',
    description: '希望熟悉夜景和外景构图，广州可约。',
    city: '广州市海珠区',
    location: '广州市海珠区',
    event_time: new Date('2026-04-19T14:00:00+08:00').getTime(),
    budget_type: 'fixed',
    budget_amount: 500,
    participant_limit: 1,
    deadline: new Date('2026-04-18T23:59:59+08:00').getTime(),
    status: DemandStatus.OPEN,
    moderation_status: ModerationStatus.APPROVED,
    created_at: new Date('2024-03-24T08:00:00Z').getTime()
  },
  {
    id: 2,
    authorId: 1003,
    demand_type: DemandType.MAKEUP,
    title: '五一漫展急求妆娘！三个角色连妆，可接单的请私聊，带价来',
    description: '需要妆容稳定、能早起到场。',
    city: '广州',
    location: '琶洲保利世贸',
    event_time: new Date('2026-05-01T07:00:00+08:00').getTime(),
    budget_type: 'negotiable',
    participant_limit: 1,
    deadline: new Date('2026-04-28T23:59:59+08:00').getTime(),
    status: DemandStatus.OPEN,
    moderation_status: ModerationStatus.APPROVED,
    created_at: new Date('2024-03-23T14:20:00Z').getTime()
  },
  {
    id: 3,
    authorId: 1005,
    demand_type: DemandType.COSER,
    title: '寻找能出《葬送的芙莉莲》修塔尔克的男Coser，已有芙莉莲和菲伦',
    description: '社团组队外拍，走互勉路线。',
    city: '深圳',
    location: '深圳市天河区',
    event_time: new Date('2026-05-18T15:00:00+08:00').getTime(),
    budget_type: 'free',
    participant_limit: 1,
    deadline: new Date('2026-05-10T23:59:59+08:00').getTime(),
    status: DemandStatus.CLOSED,
    moderation_status: ModerationStatus.APPROVED,
    created_at: new Date('2024-03-20T10:00:00Z').getTime()
  },
  {
    id: 4,
    authorId: 1,
    demand_type: DemandType.PHOTOGRAPHY,
    title: '官方招募活动跟拍摄影，需会现场抓拍与简单修图',
    description: '官方线下活动需要 1 位跟拍摄影师，活动结束后 24 小时内返图。',
    city: '广州',
    location: '动漫星城',
    event_time: new Date('2026-04-20T13:00:00+08:00').getTime(),
    budget_type: 'fixed',
    budget_amount: 800,
    participant_limit: 1,
    deadline: new Date('2026-04-18T23:59:59+08:00').getTime(),
    status: DemandStatus.OPEN,
    moderation_status: ModerationStatus.APPROVED,
    created_at: new Date('2024-03-22T12:00:00Z').getTime()
  }
]

function toDemandResponse(item: DemandItem): DemandResponse {
  const applicationSnapshot = getDemandApplicationSnapshot(item.id)
  const scheduleStatus = resolveScheduleStatusByHour(item.event_time, applicationSnapshot.doubleConfirmedCount > 0)
  const user = getStoredUserSummary(item.authorId) || {
    id: item.authorId,
    nickname: `用户${item.authorId}`,
    avatar: ''
  }
  return {
    id: item.id,
    author_id: item.authorId,
    accepted_application_id: item.accepted_application_id ?? null,
    accepted_user_id: item.accepted_user_id ?? null,
    demand_type: item.demand_type,
    title: item.title || '',
    description: item.description || '',
    city: item.city || '',
    location: item.location || '',
    event_time: item.event_time ?? null,
    budget_type: item.budget_type ?? null,
    budget_amount: item.budget_amount ?? null,
    participant_limit: item.participant_limit ?? null,
    deadline: item.deadline ?? null,
    status: item.status,
    moderation_status: item.moderation_status,
    moderation_reason: item.moderation_reason || '',
    created_at: item.created_at,
    application_count: applicationSnapshot.count,
    schedule_status: scheduleStatus,
    schedule_status_text: mapScheduleStatusText(scheduleStatus),
    user: {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar || ''
    }
  }
}

function buildDemandSubmissionKey(authorId: number, dto: CreateDemandDto) {
  return JSON.stringify({
    authorId,
    demand_type: dto.demand_type,
    title: dto.title.trim(),
    description: (dto.description || '').trim(),
    city: (dto.city || '').trim(),
    location: dto.location.trim(),
    event_time: dto.event_time,
    budget_type: dto.budget_type || '',
    budget_amount: dto.budget_amount ?? null,
    participant_limit: dto.participant_limit ?? null,
    deadline: dto.deadline ?? null
  })
}

@Injectable()
export class DemandsService {
  async list(params: { demand_type?: DemandType; page?: number; pageSize?: number }) {
    const { demand_type, page = 1, pageSize = 10 } = params || {}
    const visible = demands.filter(d => d.moderation_status === ModerationStatus.APPROVED)
    const filtered = demand_type ? visible.filter(d => d.demand_type === demand_type) : visible
    const start = (page - 1) * pageSize
    const data = filtered.slice(start, start + pageSize).map(toDemandResponse)
    return { list: data, total: filtered.length, page, pageSize }
  }

  async getById(id: number) {
    const item = demands.find(d => d.id === id)
    if (!item) return null
    if (item.moderation_status !== ModerationStatus.APPROVED) return null
    return toDemandResponse(item)
  }

  async create(authorId: number, dto: CreateDemandDto) {
    const now = Date.now()
    const submissionKey = buildDemandSubmissionKey(authorId, dto)
    const recentSubmitAt = recentDemandSubmissions.get(submissionKey)
    if (recentSubmitAt && now - recentSubmitAt < DEMAND_SUBMISSION_TTL) {
      throw new ConflictException('duplicate submit')
    }
    const review = autoModerate({
      text: `${dto.title}\n${dto.description || ''}\n${dto.location || ''}\n${dto.city || ''}`,
      images: []
    })
    const item: DemandItem = {
      id: ++seq,
      authorId,
      accepted_application_id: null,
      accepted_user_id: null,
      demand_type: dto.demand_type,
      title: dto.title.trim(),
      description: dto.description?.trim(),
      city: dto.city?.trim(),
      location: dto.location.trim(),
      event_time: dto.event_time,
      budget_type: dto.budget_type,
      budget_amount: dto.budget_amount,
      participant_limit: dto.participant_limit,
      deadline: dto.deadline,
      status: DemandStatus.OPEN,
      moderation_status: review.status,
      moderation_reason: review.reason,
      created_at: now
    }
    demands.unshift(item)
    recentDemandSubmissions.set(submissionKey, now)
    return toDemandResponse(item)
  }

  async updateMine(authorId: number, id: number, dto: Partial<CreateDemandDto>) {
    const item = demands.find((d) => d.id === id)
    if (!item || item.authorId !== authorId) return null
    if (hasBlockingConfirmedAgreement(item.id, item.event_time)) {
      throw new ConflictException('agreement locked, cancel agreement first')
    }
    if (dto.demand_type) item.demand_type = dto.demand_type
    if (typeof dto.title === 'string') item.title = dto.title.trim()
    if (typeof dto.description === 'string') item.description = dto.description.trim()
    if (typeof dto.city === 'string') item.city = dto.city.trim()
    if (typeof dto.location === 'string') item.location = dto.location.trim()
    if (typeof dto.event_time === 'number') item.event_time = dto.event_time
    if (typeof dto.budget_type === 'string') item.budget_type = dto.budget_type
    if (typeof dto.budget_amount === 'number') item.budget_amount = dto.budget_amount
    if (typeof dto.participant_limit === 'number') item.participant_limit = dto.participant_limit
    if (typeof dto.deadline === 'number') item.deadline = dto.deadline
    return toDemandResponse(item)
  }

  async bindAcceptedApplication(demandId: number, applicationId: number, applicantId: number) {
    const item = demands.find((d) => d.id === demandId)
    if (!item) return null
    item.accepted_application_id = applicationId
    item.accepted_user_id = applicantId
    return toDemandResponse(item)
  }

  async clearAcceptedApplication(demandId: number) {
    const item = demands.find((d) => d.id === demandId)
    if (!item) return null
    item.accepted_application_id = null
    item.accepted_user_id = null
    return toDemandResponse(item)
  }

  async listMine(authorId: number, page = 1, pageSize = 10) {
    const mine = demands.filter(d => d.authorId === authorId)
    const start = (page - 1) * pageSize
    const data = mine.slice(start, start + pageSize).map(toDemandResponse)
    return { list: data, total: mine.length, page, pageSize }
  }

  async countMineWithApplications(authorId: number) {
    return demands.filter((d) => d.authorId === authorId && getDemandApplicationSnapshot(d.id).count > 0).length
  }

  async review(id: number, action: 'approve' | 'reject', reason?: string) {
    const item = demands.find(d => d.id === id)
    if (!item) return null
    item.moderation_status = action === 'approve' ? ModerationStatus.APPROVED : ModerationStatus.REJECTED
    item.moderation_reason = action === 'approve' ? '' : (reason || '内容审核未通过')
    return toDemandResponse(item)
  }
}
