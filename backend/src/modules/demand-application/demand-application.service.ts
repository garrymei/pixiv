import { Injectable, BadRequestException, Inject, NotFoundException, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { DemandsService } from '../demands/demands.service'
import { ApplicationStatus, DemandStatus } from '../../types/enums'
import { DemandApplication } from '../../database/entities/demand-application.entity'
import { User } from '../../database/entities/user.entity'

function floorToHour(timestamp: number) {
  return Math.floor(timestamp / 3600000)
}

type ScheduleStatus = 'pending_confirm' | 'confirmed' | 'ongoing' | 'ended'
type ExtendedScheduleStatus =
  | ScheduleStatus
  | 'accepted'
  | 'expired'
  | 'cancel_pending'
  | 'cancelled'

export function resolveScheduleStatusByHour(eventTime?: number | null, doubleConfirmed = false): ScheduleStatus {
  if (!doubleConfirmed) return 'pending_confirm'
  if (!eventTime) return 'confirmed'

  const nowHour = floorToHour(Date.now())
  const eventHour = floorToHour(eventTime)
  if (nowHour < eventHour) return 'confirmed'
  if (nowHour === eventHour) return 'ongoing'
  return 'ended'
}

export function mapScheduleStatusText(status: ScheduleStatus) {
  if (status === 'pending_confirm') return '待确认'
  if (status === 'confirmed') return '已确认'
  if (status === 'ongoing') return '进行中'
  return '已结束'
}

function mapExtendedScheduleStatusText(status: ExtendedScheduleStatus) {
  if (status === 'accepted') return '已接受（待对方最终确认）'
  if (status === 'expired') return '已过期'
  if (status === 'cancel_pending') return '取消待确认'
  if (status === 'cancelled') return '已取消约定'
  return mapScheduleStatusText(status)
}

function isEventPast(eventTime?: number | null) {
  if (!eventTime) return false
  return floorToHour(Date.now()) > floorToHour(eventTime)
}

function isEventAtOrPast(eventTime?: number | null) {
  if (!eventTime) return false
  return floorToHour(Date.now()) >= floorToHour(eventTime)
}

function hasActiveAcceptedApplication(list: DemandApplication[]) {
  return list.some((item) => !!item.publisherAcceptedAt && !item.cancelledAt)
}

function getAcceptedApplication(list: DemandApplication[]) {
  return list.find((item) => !!item.publisherAcceptedAt && !item.cancelledAt) || null
}

export function getDemandApplicationSnapshot(list: DemandApplication[]) {
  const doubleConfirmedCount = list.filter((item) => !!item.publisherAcceptedAt && !!item.applicantConfirmedAt && !item.cancelledAt).length
  return {
    count: list.length,
    doubleConfirmedCount
  }
}

function resolveApplicationStatus(eventTime: number | null | undefined, item: DemandApplication): ExtendedScheduleStatus {
  if (item.cancelledAt) return 'cancelled'
  if (item.cancelRequestedAt) return 'cancel_pending'
  if (item.publisherAcceptedAt && item.applicantConfirmedAt) {
    return resolveScheduleStatusByHour(eventTime, true)
  }
  if (item.publisherAcceptedAt) {
    return isEventPast(eventTime) ? 'expired' : 'accepted'
  }
  return isEventPast(eventTime) ? 'expired' : 'pending_confirm'
}

function formatDemandApplicationSnapshot(eventTime: number | null | undefined, item: DemandApplication) {
  const status = resolveApplicationStatus(eventTime, item)
  return {
    application_id: item.id,
    demand_id: item.demandId,
    user_id: item.userId,
    applied_at: item.createdAt?.getTime?.() || Date.now(),
    publisher_accepted: !!item.publisherAcceptedAt,
    applicant_confirmed: !!item.applicantConfirmedAt,
    publisher_confirmed: !!item.publisherAcceptedAt,
    cancel_requested_by: item.cancelRequestedBy || null,
    cancel_requested_at: item.cancelRequestedAt ? new Date(item.cancelRequestedAt).getTime() : null,
    cancelled: !!item.cancelledAt,
    cancelled_at: item.cancelledAt ? new Date(item.cancelledAt).getTime() : null,
    schedule_status: status,
    schedule_status_text: mapExtendedScheduleStatusText(status)
  }
}

export function hasBlockingConfirmedAgreement(applications: DemandApplication[], eventTime?: number | null) {
  const accepted = getAcceptedApplication(applications)
  if (!accepted) return false
  if (!accepted.applicantConfirmedAt) return false
  if (accepted.cancelledAt) return false
  if (isEventAtOrPast(eventTime)) return false
  return true
}

@Injectable()
export class DemandApplicationService {
  constructor(
    @Inject(forwardRef(() => DemandsService)) private readonly demandsService: DemandsService,
    @InjectRepository(DemandApplication)
    private readonly applicationsRepo: Repository<DemandApplication>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>
  ) {}

  private async listApplications(demandId: number) {
    return this.applicationsRepo.find({
      where: { demandId },
      order: { createdAt: 'ASC', id: 'ASC' }
    })
  }

  async apply(demandId: number, userId: number) {
    const demand = await this.demandsService.getById(demandId)
    if (!demand) throw new NotFoundException('demand not found')
    if (demand.status !== DemandStatus.OPEN) throw new BadRequestException('closed')
    if (demand.deadline && Date.now() > demand.deadline) throw new BadRequestException('deadline passed')
    const demandApplications = await this.listApplications(demandId)
    const existing = demandApplications.find(a => a.demandId === demandId && a.userId === userId)
    if (existing) throw new BadRequestException('already applied')
    if (hasActiveAcceptedApplication(demandApplications)) throw new BadRequestException('already accepted')
    if (demand.event_time && floorToHour(Date.now()) > floorToHour(demand.event_time)) {
      throw new BadRequestException('event ended')
    }
    await this.applicationsRepo.save(this.applicationsRepo.create({
      demandId,
      userId,
      status: ApplicationStatus.APPLIED
    }))
    return { applied: true }
  }

  async status(demandId: number, userId: number) {
    const demand = await this.demandsService.getById(demandId)
    if (!demand) throw new NotFoundException('demand not found')
    const demandApplies = await this.listApplications(demandId)

    const mine = demandApplies.find(a => a.demandId === demandId && a.userId === userId)
    if (mine) {
      const status = resolveApplicationStatus(demand.event_time, mine)
      const canFinalConfirm = !!mine.publisherAcceptedAt && !mine.applicantConfirmedAt && !mine.cancelledAt
      const canRequestCancel =
        !!mine.publisherAcceptedAt &&
        !!mine.applicantConfirmedAt &&
        !mine.cancelRequestedAt &&
        !mine.cancelledAt &&
        !isEventAtOrPast(demand.event_time)
      const canConfirmCancel =
        !!mine.cancelRequestedAt &&
        mine.cancelRequestedBy === 'publisher' &&
        !mine.cancelledAt &&
        !mine.applicantCancelConfirmedAt
      return {
        applied: true,
        role: 'applicant',
        application_id: mine.id,
        accepted_application_id: demand.accepted_application_id || null,
        accepted_user_id: demand.accepted_user_id || null,
        can_apply: false,
        can_accept: false,
        applicant_confirmed: !!mine.applicantConfirmedAt,
        publisher_confirmed: !!mine.publisherAcceptedAt,
        can_confirm: canFinalConfirm,
        confirm_action: canFinalConfirm ? 'final_confirm' : null,
        can_request_cancel: canRequestCancel,
        can_confirm_cancel: canConfirmCancel,
        cancel_requested_by: mine.cancelRequestedBy || null,
        schedule_status: status,
        schedule_status_text: mapExtendedScheduleStatusText(status)
      }
    }

    const isPublisher = demand.author_id === userId
    if (isPublisher && demandApplies.length > 0) {
      const accepted = getAcceptedApplication(demandApplies)
      const target = accepted || demandApplies.find((a) => !a.publisherAcceptedAt) || demandApplies[0]
      const status = resolveApplicationStatus(demand.event_time, target)
      const canAccept =
        !accepted &&
        !target.publisherAcceptedAt &&
        !isEventPast(demand.event_time)
      const canRequestCancel =
        !!target.publisherAcceptedAt &&
        !!target.applicantConfirmedAt &&
        !target.cancelRequestedAt &&
        !target.cancelledAt &&
        !isEventAtOrPast(demand.event_time)
      const canConfirmCancel =
        !!target.cancelRequestedAt &&
        target.cancelRequestedBy === 'applicant' &&
        !target.cancelledAt &&
        !target.publisherCancelConfirmedAt
      return {
        applied: false,
        role: 'publisher',
        application_id: target.id,
        accepted_application_id: demand.accepted_application_id || null,
        accepted_user_id: demand.accepted_user_id || null,
        has_applicants: true,
        can_apply: false,
        can_accept: canAccept,
        applicant_confirmed: !!target.applicantConfirmedAt,
        publisher_confirmed: !!target.publisherAcceptedAt,
        can_confirm: canAccept,
        confirm_action: canAccept ? 'accept' : null,
        can_request_cancel: canRequestCancel,
        can_confirm_cancel: canConfirmCancel,
        cancel_requested_by: target.cancelRequestedBy || null,
        schedule_status: status,
        schedule_status_text: mapExtendedScheduleStatusText(status)
      }
    }

    return {
      applied: false,
      can_confirm: false,
      can_accept: false,
      can_apply: !hasActiveAcceptedApplication(demandApplies) && !isEventPast(demand.event_time),
      apply_disabled_reason: hasActiveAcceptedApplication(demandApplies) ? 'already accepted' : undefined
    }
  }

  async confirm(demandId: number, userId: number, applicationId?: number) {
    const demand = await this.demandsService.getById(demandId)
    if (!demand) throw new NotFoundException('demand not found')
    const demandApplies = await this.listApplications(demandId)

    const mine = demandApplies.find((a) => a.demandId === demandId && a.userId === userId)
    if (mine) {
      if (!mine.publisherAcceptedAt) throw new BadRequestException('not accepted yet')
      if (mine.cancelRequestedAt || mine.cancelledAt) throw new BadRequestException('agreement is cancelling or cancelled')
      mine.applicantConfirmedAt = mine.applicantConfirmedAt || new Date()
      await this.applicationsRepo.save(mine)
      const status = resolveApplicationStatus(demand.event_time, mine)
      return {
        confirmed: true,
        role: 'applicant',
        application_id: mine.id,
        schedule_status: status,
        schedule_status_text: mapExtendedScheduleStatusText(status)
      }
    }

    if (demand.author_id !== userId) {
      throw new BadRequestException('no permission to confirm')
    }

    if (demandApplies.length === 0) {
      throw new BadRequestException('no applications')
    }

    if (!applicationId) {
      throw new BadRequestException('application_id required')
    }
    const target = demandApplies.find((a) => a.id === applicationId)
    if (!target) {
      throw new BadRequestException('application not found')
    }
    const accepted = getAcceptedApplication(demandApplies)
    if (accepted && accepted.id !== target.id) throw new BadRequestException('already accepted another applicant')
    if (target.cancelledAt) throw new BadRequestException('application cancelled')
    if (isEventPast(demand.event_time)) throw new BadRequestException('event ended')
    target.publisherAcceptedAt = target.publisherAcceptedAt || new Date()
    target.status = ApplicationStatus.APPROVED
    await this.applicationsRepo.save(target)
    await this.demandsService.bindAcceptedApplication(demandId, target.id, target.userId)
    const status = resolveApplicationStatus(demand.event_time, target)
    return {
      confirmed: true,
      role: 'publisher',
      application_id: target.id,
      accepted: true,
      schedule_status: status,
      schedule_status_text: mapExtendedScheduleStatusText(status)
    }
  }

  async requestCancelAgreement(demandId: number, userId: number) {
    const demand = await this.demandsService.getById(demandId)
    if (!demand) throw new NotFoundException('demand not found')
    const accepted = getAcceptedApplication(await this.listApplications(demandId))

    if (!accepted || !accepted.applicantConfirmedAt) {
      throw new BadRequestException('no confirmed agreement')
    }
    if (accepted.cancelledAt) throw new BadRequestException('already cancelled')
    if (isEventAtOrPast(demand.event_time)) throw new BadRequestException('event started or ended')
    if (accepted.cancelRequestedAt) throw new BadRequestException('cancel already requested')

    const isPublisher = demand.author_id === userId
    const isApplicant = accepted.userId === userId
    if (!isPublisher && !isApplicant) throw new BadRequestException('no permission')

    accepted.cancelRequestedAt = new Date()
    accepted.cancelRequestedBy = isPublisher ? 'publisher' : 'applicant'
    if (isPublisher) {
      accepted.publisherCancelConfirmedAt = accepted.cancelRequestedAt
      accepted.applicantCancelConfirmedAt = null
    } else {
      accepted.applicantCancelConfirmedAt = accepted.cancelRequestedAt
      accepted.publisherCancelConfirmedAt = null
    }
    await this.applicationsRepo.save(accepted)

    return {
      requested: true,
      application_id: accepted.id,
      cancel_requested_by: accepted.cancelRequestedBy,
      schedule_status: 'cancel_pending',
      schedule_status_text: mapExtendedScheduleStatusText('cancel_pending')
    }
  }

  async confirmCancelAgreement(demandId: number, userId: number) {
    const demand = await this.demandsService.getById(demandId)
    if (!demand) throw new NotFoundException('demand not found')
    const accepted = getAcceptedApplication(await this.listApplications(demandId))

    if (!accepted || !accepted.cancelRequestedAt) throw new BadRequestException('no pending cancel request')
    if (accepted.cancelledAt) throw new BadRequestException('already cancelled')

    const isPublisher = demand.author_id === userId
    const isApplicant = accepted.userId === userId
    if (!isPublisher && !isApplicant) throw new BadRequestException('no permission')

    if (accepted.cancelRequestedBy === 'publisher' && isPublisher) {
      throw new BadRequestException('wait applicant confirm')
    }
    if (accepted.cancelRequestedBy === 'applicant' && isApplicant) {
      throw new BadRequestException('wait publisher confirm')
    }

    if (isPublisher) accepted.publisherCancelConfirmedAt = new Date()
    if (isApplicant) accepted.applicantCancelConfirmedAt = new Date()

    if (accepted.publisherCancelConfirmedAt && accepted.applicantCancelConfirmedAt) {
      accepted.cancelledAt = new Date()
      await this.demandsService.clearAcceptedApplication(demandId)
    }
    await this.applicationsRepo.save(accepted)

    return {
      confirmed: true,
      cancelled: !!accepted.cancelledAt,
      application_id: accepted.id,
      schedule_status: accepted.cancelledAt ? 'cancelled' : 'cancel_pending',
      schedule_status_text: mapExtendedScheduleStatusText(accepted.cancelledAt ? 'cancelled' : 'cancel_pending')
    }
  }

  async listByDemand(demandId: number, userId: number) {
    const demand = await this.demandsService.getById(demandId)
    if (!demand) throw new NotFoundException('demand not found')
    if (demand.author_id !== userId) throw new BadRequestException('no permission')

    const applications = await this.listApplications(demandId)
    const userIds = applications.map((item) => item.userId)
    const users = userIds.length > 0 ? await this.usersRepo.find({ where: { id: In(userIds) } }) : []
    const userMap = new Map(users.map((user) => [user.id, user]))
    const list = applications.map((item) => {
      const user = userMap.get(item.userId)
      return {
        ...formatDemandApplicationSnapshot(demand.event_time, item),
        user: {
          id: item.userId,
          nickname: user?.nickname || `用户${item.userId}`,
          avatar: user?.avatarUrl || ''
        }
      }
    })

    return { list }
  }

  async listByUser(userId: number) {
    const my = await this.applicationsRepo.find({ where: { userId }, order: { createdAt: 'DESC', id: 'DESC' } })
    const detailed = await Promise.all(
      my.map(async (a) => {
        const d = await this.demandsService.getById(a.demandId)
        if (!d) return null
        return { ...d, ...formatDemandApplicationSnapshot(d.event_time, a) }
      })
    )
    return { list: detailed.filter(Boolean) }
  }
}
