import { ConflictException, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { CreateDemandDto } from './dto/create-demand.dto'
import { DemandType, DemandStatus, ModerationStatus } from '../../types/enums'
import { autoModerate } from '../../common/utils/moderation'
import { mapScheduleStatusText, resolveScheduleStatusByHour } from '../demand-application/demand-application.service'
import { Demand } from '../../database/entities/demand.entity'
import { DemandApplication } from '../../database/entities/demand-application.entity'
import { User } from '../../database/entities/user.entity'

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
  confirmed_count: number
  accepted_count: number
  can_continue_recruit: boolean
  time_change_requested_by: number | null
  requested_event_time: number | null
  cancel_requested_by: number | null
  cancel_requested_at: number | null
  cancelled_at: number | null
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

const DEMAND_SUBMISSION_TTL = 5000
const recentDemandSubmissions = new Map<string, number>()

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

const DEMAND_STATUS_REFRESH_INTERVAL = 60 * 60 * 1000

@Injectable()
export class DemandsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DemandsService.name)
  private refreshTimer?: NodeJS.Timeout
  private refreshPromise: Promise<void> | null = null

  constructor(
    @InjectRepository(Demand)
    private readonly demandsRepo: Repository<Demand>,
    @InjectRepository(DemandApplication)
    private readonly applicationsRepo: Repository<DemandApplication>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>
  ) {}

  onModuleInit() {
    this.refreshStaleStatuses().catch((error) => {
      this.logger.warn(`initial demand status refresh failed: ${error?.message || error}`)
    })
    this.refreshTimer = setInterval(() => {
      this.refreshStaleStatuses().catch((error) => {
        this.logger.warn(`scheduled demand status refresh failed: ${error?.message || error}`)
      })
    }, DEMAND_STATUS_REFRESH_INTERVAL)
    this.refreshTimer.unref?.()
  }

  onModuleDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = undefined
    }
  }

  async refreshStaleStatuses() {
    if (this.refreshPromise) return this.refreshPromise
    this.refreshPromise = this.runStatusRefresh().finally(() => {
      this.refreshPromise = null
    })
    return this.refreshPromise
  }

  private async runStatusRefresh() {
    const openDemands = await this.demandsRepo.find({
      where: { status: DemandStatus.OPEN },
      select: ['id', 'participantLimit']
    })
    if (openDemands.length > 0) {
      const ids = openDemands.map((item) => item.id)
      const rows = await this.applicationsRepo
        .createQueryBuilder('app')
        .select('app.demand_id', 'demandId')
        .addSelect('COUNT(*)', 'total')
        .where('app.demand_id IN (:...ids)', { ids })
        .andWhere('app.publisher_accepted_at IS NOT NULL')
        .andWhere('app.applicant_confirmed_at IS NOT NULL')
        .andWhere('app.cancelled_at IS NULL')
        .groupBy('app.demand_id')
        .getRawMany<{ demandId: string; total: string }>()

      const confirmedMap = new Map(rows.map((row) => [Number(row.demandId), Number(row.total || 0)]))
      const completedIds = openDemands
        .filter((item) => (confirmedMap.get(item.id) || 0) >= (item.participantLimit || 1))
        .map((item) => item.id)

      if (completedIds.length > 0) {
        await this.demandsRepo
          .createQueryBuilder()
          .update(Demand)
          .set({ status: DemandStatus.COMPLETED })
          .where('id IN (:...completedIds)', { completedIds })
          .andWhere('status = :status', { status: DemandStatus.OPEN })
          .execute()
      }
    }

    const now = new Date()
    await this.demandsRepo
      .createQueryBuilder()
      .update(Demand)
      .set({ status: DemandStatus.CLOSED })
      .where('status = :status', { status: DemandStatus.OPEN })
      .andWhere('(deadline IS NOT NULL AND deadline < :now OR event_time IS NOT NULL AND event_time < :now)', { now })
      .execute()
  }

  private async buildResponses(items: Demand[]): Promise<DemandResponse[]> {
    if (items.length === 0) return []
    const demandIds = items.map((item) => item.id)
    const authorIds = Array.from(new Set(items.map((item) => item.authorId)))
    const [applications, users] = await Promise.all([
      this.applicationsRepo.find({ where: { demandId: In(demandIds) } }),
      this.usersRepo.find({ where: { id: In(authorIds) } })
    ])

    const appStats = new Map<number, { count: number; doubleConfirmedCount: number; acceptedCount: number }>()
    for (const app of applications) {
      const prev = appStats.get(app.demandId) || { count: 0, doubleConfirmedCount: 0, acceptedCount: 0 }
      prev.count += 1
      if (app.publisherAcceptedAt && !app.cancelledAt) {
        prev.acceptedCount += 1
      }
      if (app.publisherAcceptedAt && app.applicantConfirmedAt && !app.cancelledAt) {
        prev.doubleConfirmedCount += 1
      }
      appStats.set(app.demandId, prev)
    }
    const userMap = new Map(users.map((user) => [user.id, user]))

    return items.map((item) => {
      const stats = appStats.get(item.id) || { count: 0, doubleConfirmedCount: 0, acceptedCount: 0 }
      const scheduleStatus = resolveScheduleStatusByHour(
        item.eventTime ? new Date(item.eventTime).getTime() : null,
        stats.doubleConfirmedCount > 0
      )
      const user = userMap.get(item.authorId)
      return {
        id: item.id,
        author_id: item.authorId,
        accepted_application_id: item.acceptedApplicationId ?? null,
        accepted_user_id: item.acceptedUserId ?? null,
        demand_type: item.demandType,
        title: item.title || '',
        description: item.description || '',
        city: item.city || '',
        location: item.location || '',
        event_time: item.eventTime ? new Date(item.eventTime).getTime() : null,
        budget_type: item.budgetType ?? null,
        budget_amount: item.budgetAmount !== undefined && item.budgetAmount !== null ? Number(item.budgetAmount) : null,
        participant_limit: item.participantLimit ?? null,
        deadline: item.deadline ? new Date(item.deadline).getTime() : null,
        status: item.status,
        confirmed_count: stats.doubleConfirmedCount,
        accepted_count: stats.acceptedCount,
        can_continue_recruit:
          item.status !== DemandStatus.CANCELLED &&
          stats.doubleConfirmedCount < (item.participantLimit || 1) &&
          (!item.eventTime || Math.floor(Date.now() / 3600000) < Math.floor(new Date(item.eventTime).getTime() / 3600000)),
        time_change_requested_by: item.timeChangeRequestedBy ?? null,
        requested_event_time: item.requestedEventTime ? new Date(item.requestedEventTime).getTime() : null,
        cancel_requested_by: item.cancelRequestedBy ?? null,
        cancel_requested_at: item.cancelRequestedAt ? new Date(item.cancelRequestedAt).getTime() : null,
        cancelled_at: item.cancelledAt ? new Date(item.cancelledAt).getTime() : null,
        moderation_status: item.moderationStatus,
        moderation_reason: item.moderationReason || '',
        created_at: item.createdAt?.getTime?.() || Date.now(),
        application_count: stats.count,
        schedule_status: scheduleStatus,
        schedule_status_text: mapScheduleStatusText(scheduleStatus),
        user: {
          id: item.authorId,
          nickname: user?.nickname || `用户${item.authorId}`,
          avatar: user?.avatarUrl || ''
        }
      }
    })
  }

  private async hasBlockingConfirmedAgreement(demandId: number, eventTime?: Date | null) {
    const applications = await this.applicationsRepo.find({ where: { demandId } })
    const accepted = applications.find((item) => !!item.publisherAcceptedAt && !!item.applicantConfirmedAt && !item.cancelledAt)
    if (!accepted || !accepted.publisherAcceptedAt || !accepted.applicantConfirmedAt) return false
    if (!eventTime) return true
    const nowHour = Math.floor(Date.now() / 3600000)
    const eventHour = Math.floor(new Date(eventTime).getTime() / 3600000)
    return nowHour < eventHour
  }

  async list(params: { demand_type?: DemandType; page?: number; pageSize?: number }) {
    await this.refreshStaleStatuses()
    const { demand_type, page = 1, pageSize = 10 } = params || {}
    const [items, total] = await this.demandsRepo.findAndCount({
      where: {
        moderationStatus: ModerationStatus.APPROVED,
        ...(demand_type ? { demandType: demand_type } : {})
      },
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
    const data = await this.buildResponses(items)
    return { list: data, total, page, pageSize }
  }

  async getById(id: number) {
    await this.refreshStaleStatuses()
    const item = await this.demandsRepo.findOne({ where: { id } })
    if (!item || item.moderationStatus !== ModerationStatus.APPROVED) return null
    const [data] = await this.buildResponses([item])
    return data || null
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
    const entity = await this.demandsRepo.save(this.demandsRepo.create({
      authorId,
      acceptedApplicationId: null,
      acceptedUserId: null,
      demandType: dto.demand_type,
      title: dto.title.trim(),
      description: dto.description?.trim() || '',
      city: dto.city?.trim() || '',
      location: dto.location.trim(),
      eventTime: new Date(dto.event_time),
      budgetType: dto.budget_type,
      budgetAmount: dto.budget_amount,
      participantLimit: dto.participant_limit ?? 1,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      status: DemandStatus.OPEN,
      timeChangeRequestedBy: null,
      requestedEventTime: null,
      cancelRequestedBy: null,
      cancelRequestedAt: null,
      cancelledAt: null,
      moderationStatus: review.status,
      moderationReason: review.reason || ''
    }))
    recentDemandSubmissions.set(submissionKey, now)
    const [data] = await this.buildResponses([entity])
    return data
  }

  async updateMine(authorId: number, id: number, dto: Partial<CreateDemandDto>) {
    const item = await this.demandsRepo.findOne({ where: { id } })
    if (!item || item.authorId !== authorId) return null
    if (await this.hasBlockingConfirmedAgreement(item.id, item.eventTime)) {
      throw new ConflictException('agreement locked, cancel agreement first')
    }
    if (dto.demand_type) item.demandType = dto.demand_type
    if (typeof dto.title === 'string') item.title = dto.title.trim()
    if (typeof dto.description === 'string') item.description = dto.description.trim()
    if (typeof dto.city === 'string') item.city = dto.city.trim()
    if (typeof dto.location === 'string') item.location = dto.location.trim()
    if (typeof dto.event_time === 'number') item.eventTime = new Date(dto.event_time)
    if (typeof dto.budget_type === 'string') item.budgetType = dto.budget_type
    if (typeof dto.budget_amount === 'number') item.budgetAmount = dto.budget_amount
    if (typeof dto.participant_limit === 'number') item.participantLimit = dto.participant_limit
    if (typeof dto.deadline === 'number') item.deadline = new Date(dto.deadline)
    const saved = await this.demandsRepo.save(item)
    const [data] = await this.buildResponses([saved])
    return data || null
  }

  async bindAcceptedApplication(demandId: number, applicationId: number, applicantId: number) {
    const item = await this.demandsRepo.findOne({ where: { id: demandId } })
    if (!item) return null
    item.acceptedApplicationId = applicationId
    item.acceptedUserId = applicantId
    item.status = DemandStatus.OPEN
    const saved = await this.demandsRepo.save(item)
    const [data] = await this.buildResponses([saved])
    return data || null
  }

  async clearAcceptedApplication(demandId: number) {
    const item = await this.demandsRepo.findOne({ where: { id: demandId } })
    if (!item) return null
    item.acceptedApplicationId = null
    item.acceptedUserId = null
    const saved = await this.demandsRepo.save(item)
    const [data] = await this.buildResponses([saved])
    return data || null
  }

  async setStatus(demandId: number, status: DemandStatus) {
    const item = await this.demandsRepo.findOne({ where: { id: demandId } })
    if (!item) return null
    item.status = status
    if (status === DemandStatus.CANCELLED) item.cancelledAt = item.cancelledAt || new Date()
    const saved = await this.demandsRepo.save(item)
    const [data] = await this.buildResponses([saved])
    return data || null
  }

  async getEntityById(id: number) {
    return this.demandsRepo.findOne({ where: { id } })
  }

  async saveEntity(entity: Demand) {
    const saved = await this.demandsRepo.save(entity)
    const [data] = await this.buildResponses([saved])
    return data || null
  }

  async listMine(authorId: number, page = 1, pageSize = 10) {
    await this.refreshStaleStatuses()
    const [items, total] = await this.demandsRepo.findAndCount({
      where: { authorId },
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
    const data = await this.buildResponses(items)
    return { list: data, total, page, pageSize }
  }

  async countMineWithApplications(authorId: number) {
    const mine = await this.demandsRepo.find({ where: { authorId }, select: ['id'] })
    const ids = mine.map((item) => item.id)
    if (ids.length === 0) return 0
    const rows = await this.applicationsRepo
      .createQueryBuilder('app')
      .select('COUNT(DISTINCT app.demand_id)', 'total')
      .where('app.demand_id IN (:...ids)', { ids })
      .getRawOne<{ total?: string }>()
    return Number(rows?.total || 0)
  }

  async review(id: number, action: 'approve' | 'reject', reason?: string) {
    const item = await this.demandsRepo.findOne({ where: { id } })
    if (!item) return null
    item.moderationStatus = action === 'approve' ? ModerationStatus.APPROVED : ModerationStatus.REJECTED
    item.moderationReason = action === 'approve' ? '' : (reason || '内容审核未通过')
    const saved = await this.demandsRepo.save(item)
    const [data] = await this.buildResponses([saved])
    return data || null
  }
}
