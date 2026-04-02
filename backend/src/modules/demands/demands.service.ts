import { ConflictException, Injectable } from '@nestjs/common'
import { CreateDemandDto } from './dto/create-demand.dto'
import { DemandType, DemandStatus } from '../../types/enums'
import { getStoredUserSummary } from '../users/users.service'

type DemandItem = {
  id: number
  authorId: number
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
  created_at: number
}

type DemandResponse = {
  id: number
  author_id: number
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
  created_at: number
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
    authorId: 1,
    demand_type: DemandType.PHOTOGRAPHY,
    title: '广州塔夜景拍摄',
    description: '需要摄影师一位，夜景霓虹风',
    city: '广州',
    location: '广州塔',
    event_time: Date.now() + 86400000,
    budget_type: 'fixed',
    budget_amount: 300,
    participant_limit: 1,
    deadline: Date.now() + 80000000,
    status: DemandStatus.OPEN,
    created_at: Date.now()
  }
]

function toDemandResponse(item: DemandItem): DemandResponse {
  const user = getStoredUserSummary(item.authorId) || {
    id: item.authorId,
    nickname: `用户${item.authorId}`,
    avatar: ''
  }
  return {
    id: item.id,
    author_id: item.authorId,
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
    created_at: item.created_at,
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
    const filtered = demand_type ? demands.filter(d => d.demand_type === demand_type) : demands
    const start = (page - 1) * pageSize
    const data = filtered.slice(start, start + pageSize).map(toDemandResponse)
    return { list: data, total: filtered.length, page, pageSize }
  }

  async getById(id: number) {
    const item = demands.find(d => d.id === id)
    return item ? toDemandResponse(item) : null
  }

  async create(authorId: number, dto: CreateDemandDto) {
    const now = Date.now()
    const submissionKey = buildDemandSubmissionKey(authorId, dto)
    const recentSubmitAt = recentDemandSubmissions.get(submissionKey)
    if (recentSubmitAt && now - recentSubmitAt < DEMAND_SUBMISSION_TTL) {
      throw new ConflictException('duplicate submit')
    }
    const item: DemandItem = {
      id: ++seq,
      authorId,
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
      created_at: now
    }
    demands.unshift(item)
    recentDemandSubmissions.set(submissionKey, now)
    return toDemandResponse(item)
  }

  async listMine(authorId: number, page = 1, pageSize = 10) {
    const mine = demands.filter(d => d.authorId === authorId)
    const start = (page - 1) * pageSize
    const data = mine.slice(start, start + pageSize).map(toDemandResponse)
    return { list: data, total: mine.length, page, pageSize }
  }
}
