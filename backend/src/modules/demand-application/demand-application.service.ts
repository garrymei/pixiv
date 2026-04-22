import { Injectable, BadRequestException, Inject, NotFoundException, forwardRef } from '@nestjs/common'
import { DemandsService } from '../demands/demands.service'
import { DemandStatus } from '../../types/enums'
import { getStoredUserSummary } from '../users/users.service'

type DemandApplyItem = {
  id: number
  demand_id: number
  user_id: number
  created_at: number
  publisher_accepted_at?: number
  applicant_confirmed_at?: number
  cancel_requested_by?: 'publisher' | 'applicant'
  cancel_requested_at?: number
  publisher_cancel_confirmed_at?: number
  applicant_cancel_confirmed_at?: number
  cancelled_at?: number
}

let applySeq = 3
const applies: DemandApplyItem[] = [
  {
    id: 1,
    demand_id: 1,
    user_id: 1003,
    created_at: new Date('2024-03-24T17:00:00Z').getTime(),
    publisher_accepted_at: new Date('2024-03-24T18:00:00Z').getTime(),
    applicant_confirmed_at: new Date('2024-03-25T08:00:00Z').getTime(),
  },
  { id: 2, demand_id: 4, user_id: 1003, created_at: new Date('2024-03-22T13:00:00Z').getTime() },
  { id: 3, demand_id: 2, user_id: 1002, created_at: new Date('2024-03-23T23:00:00Z').getTime() }
]

export function getDemandApplicationCountSnapshot(demandId: number) {
  return applies.filter((item) => item.demand_id === demandId).length
}

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

function hasActiveAcceptedApplication(demandId: number) {
  return applies.some((item) => item.demand_id === demandId && !!item.publisher_accepted_at && !item.cancelled_at)
}

function getAcceptedApplication(demandId: number) {
  return applies.find((item) => item.demand_id === demandId && !!item.publisher_accepted_at && !item.cancelled_at) || null
}

export function getDemandApplicationSnapshot(demandId: number) {
  const list = applies.filter((item) => item.demand_id === demandId)
  const doubleConfirmedCount = list.filter((item) => !!item.publisher_accepted_at && !!item.applicant_confirmed_at && !item.cancelled_at).length
  return {
    count: list.length,
    doubleConfirmedCount
  }
}

function resolveApplicationStatus(eventTime: number | null | undefined, item: DemandApplyItem): ExtendedScheduleStatus {
  if (item.cancelled_at) return 'cancelled'
  if (item.cancel_requested_at) return 'cancel_pending'
  if (item.publisher_accepted_at && item.applicant_confirmed_at) {
    return resolveScheduleStatusByHour(eventTime, true)
  }
  if (item.publisher_accepted_at) {
    return isEventPast(eventTime) ? 'expired' : 'accepted'
  }
  return isEventPast(eventTime) ? 'expired' : 'pending_confirm'
}

function formatDemandApplicationSnapshot(eventTime: number | null | undefined, item: DemandApplyItem) {
  const status = resolveApplicationStatus(eventTime, item)
  return {
    application_id: item.id,
    demand_id: item.demand_id,
    user_id: item.user_id,
    applied_at: item.created_at,
    publisher_accepted: !!item.publisher_accepted_at,
    applicant_confirmed: !!item.applicant_confirmed_at,
    publisher_confirmed: !!item.publisher_accepted_at,
    cancel_requested_by: item.cancel_requested_by || null,
    cancel_requested_at: item.cancel_requested_at || null,
    cancelled: !!item.cancelled_at,
    cancelled_at: item.cancelled_at || null,
    schedule_status: status,
    schedule_status_text: mapExtendedScheduleStatusText(status)
  }
}

export function hasBlockingConfirmedAgreement(demandId: number, eventTime?: number | null) {
  const accepted = getAcceptedApplication(demandId)
  if (!accepted) return false
  if (!accepted.applicant_confirmed_at) return false
  if (accepted.cancelled_at) return false
  if (isEventAtOrPast(eventTime)) return false
  return true
}

@Injectable()
export class DemandApplicationService {
  constructor(@Inject(forwardRef(() => DemandsService)) private readonly demandsService: DemandsService) {}

  async apply(demandId: number, userId: number) {
    const demand = await this.demandsService.getById(demandId)
    if (!demand) throw new NotFoundException('demand not found')
    if (demand.status !== DemandStatus.OPEN) throw new BadRequestException('closed')
    if (demand.deadline && Date.now() > demand.deadline) throw new BadRequestException('deadline passed')
    const existing = applies.find(a => a.demand_id === demandId && a.user_id === userId)
    if (existing) throw new BadRequestException('already applied')
    if (hasActiveAcceptedApplication(demandId)) throw new BadRequestException('already accepted')
    if (demand.event_time && floorToHour(Date.now()) > floorToHour(demand.event_time)) {
      throw new BadRequestException('event ended')
    }
    const item = { id: ++applySeq, demand_id: demandId, user_id: userId, created_at: Date.now() }
    applies.push(item)
    return { applied: true }
  }

  async status(demandId: number, userId: number) {
    const demand = await this.demandsService.getById(demandId)
    if (!demand) throw new NotFoundException('demand not found')

    const mine = applies.find(a => a.demand_id === demandId && a.user_id === userId)
    if (mine) {
      const status = resolveApplicationStatus(demand.event_time, mine)
      const canFinalConfirm = !!mine.publisher_accepted_at && !mine.applicant_confirmed_at && !mine.cancelled_at
      const canRequestCancel =
        !!mine.publisher_accepted_at &&
        !!mine.applicant_confirmed_at &&
        !mine.cancel_requested_at &&
        !mine.cancelled_at &&
        !isEventAtOrPast(demand.event_time)
      const canConfirmCancel =
        !!mine.cancel_requested_at &&
        mine.cancel_requested_by === 'publisher' &&
        !mine.cancelled_at &&
        !mine.applicant_cancel_confirmed_at
      return {
        applied: true,
        role: 'applicant',
        application_id: mine.id,
        accepted_application_id: demand.accepted_application_id || null,
        accepted_user_id: demand.accepted_user_id || null,
        can_apply: false,
        can_accept: false,
        applicant_confirmed: !!mine.applicant_confirmed_at,
        publisher_confirmed: !!mine.publisher_accepted_at,
        can_confirm: canFinalConfirm,
        confirm_action: canFinalConfirm ? 'final_confirm' : null,
        can_request_cancel: canRequestCancel,
        can_confirm_cancel: canConfirmCancel,
        cancel_requested_by: mine.cancel_requested_by || null,
        schedule_status: status,
        schedule_status_text: mapExtendedScheduleStatusText(status)
      }
    }

    const isPublisher = demand.author_id === userId
    const demandApplies = applies
      .filter((a) => a.demand_id === demandId)
      .sort((a, b) => a.created_at - b.created_at)
    if (isPublisher && demandApplies.length > 0) {
      const accepted = getAcceptedApplication(demandId)
      const target = accepted || demandApplies.find((a) => !a.publisher_accepted_at) || demandApplies[0]
      const status = resolveApplicationStatus(demand.event_time, target)
      const canAccept =
        !accepted &&
        !target.publisher_accepted_at &&
        !isEventPast(demand.event_time)
      const canRequestCancel =
        !!target.publisher_accepted_at &&
        !!target.applicant_confirmed_at &&
        !target.cancel_requested_at &&
        !target.cancelled_at &&
        !isEventAtOrPast(demand.event_time)
      const canConfirmCancel =
        !!target.cancel_requested_at &&
        target.cancel_requested_by === 'applicant' &&
        !target.cancelled_at &&
        !target.publisher_cancel_confirmed_at
      return {
        applied: false,
        role: 'publisher',
        application_id: target.id,
        accepted_application_id: demand.accepted_application_id || null,
        accepted_user_id: demand.accepted_user_id || null,
        has_applicants: true,
        can_apply: false,
        can_accept: canAccept,
        applicant_confirmed: !!target.applicant_confirmed_at,
        publisher_confirmed: !!target.publisher_accepted_at,
        can_confirm: canAccept,
        confirm_action: canAccept ? 'accept' : null,
        can_request_cancel: canRequestCancel,
        can_confirm_cancel: canConfirmCancel,
        cancel_requested_by: target.cancel_requested_by || null,
        schedule_status: status,
        schedule_status_text: mapExtendedScheduleStatusText(status)
      }
    }

    return {
      applied: false,
      can_confirm: false,
      can_accept: false,
      can_apply: !hasActiveAcceptedApplication(demandId) && !isEventPast(demand.event_time),
      apply_disabled_reason: hasActiveAcceptedApplication(demandId) ? 'already accepted' : undefined
    }
  }

  async confirm(demandId: number, userId: number, applicationId?: number) {
    const demand = await this.demandsService.getById(demandId)
    if (!demand) throw new NotFoundException('demand not found')

    const mine = applies.find((a) => a.demand_id === demandId && a.user_id === userId)
    if (mine) {
      if (!mine.publisher_accepted_at) throw new BadRequestException('not accepted yet')
      if (mine.cancel_requested_at || mine.cancelled_at) throw new BadRequestException('agreement is cancelling or cancelled')
      mine.applicant_confirmed_at = mine.applicant_confirmed_at || Date.now()
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

    const demandApplies = applies
      .filter((a) => a.demand_id === demandId)
      .sort((a, b) => a.created_at - b.created_at)
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
    const accepted = getAcceptedApplication(demandId)
    if (accepted && accepted.id !== target.id) throw new BadRequestException('already accepted another applicant')
    if (target.cancelled_at) throw new BadRequestException('application cancelled')
    if (isEventPast(demand.event_time)) throw new BadRequestException('event ended')
    target.publisher_accepted_at = target.publisher_accepted_at || Date.now()
    await this.demandsService.bindAcceptedApplication(demandId, target.id, target.user_id)
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

    const accepted = getAcceptedApplication(demandId)
    if (!accepted || !accepted.applicant_confirmed_at) {
      throw new BadRequestException('no confirmed agreement')
    }
    if (accepted.cancelled_at) throw new BadRequestException('already cancelled')
    if (isEventAtOrPast(demand.event_time)) throw new BadRequestException('event started or ended')
    if (accepted.cancel_requested_at) throw new BadRequestException('cancel already requested')

    const isPublisher = demand.author_id === userId
    const isApplicant = accepted.user_id === userId
    if (!isPublisher && !isApplicant) throw new BadRequestException('no permission')

    accepted.cancel_requested_at = Date.now()
    accepted.cancel_requested_by = isPublisher ? 'publisher' : 'applicant'
    if (isPublisher) {
      accepted.publisher_cancel_confirmed_at = accepted.cancel_requested_at
      accepted.applicant_cancel_confirmed_at = undefined
    } else {
      accepted.applicant_cancel_confirmed_at = accepted.cancel_requested_at
      accepted.publisher_cancel_confirmed_at = undefined
    }

    return {
      requested: true,
      application_id: accepted.id,
      cancel_requested_by: accepted.cancel_requested_by,
      schedule_status: 'cancel_pending',
      schedule_status_text: mapExtendedScheduleStatusText('cancel_pending')
    }
  }

  async confirmCancelAgreement(demandId: number, userId: number) {
    const demand = await this.demandsService.getById(demandId)
    if (!demand) throw new NotFoundException('demand not found')

    const accepted = getAcceptedApplication(demandId)
    if (!accepted || !accepted.cancel_requested_at) throw new BadRequestException('no pending cancel request')
    if (accepted.cancelled_at) throw new BadRequestException('already cancelled')

    const isPublisher = demand.author_id === userId
    const isApplicant = accepted.user_id === userId
    if (!isPublisher && !isApplicant) throw new BadRequestException('no permission')

    if (accepted.cancel_requested_by === 'publisher' && isPublisher) {
      throw new BadRequestException('wait applicant confirm')
    }
    if (accepted.cancel_requested_by === 'applicant' && isApplicant) {
      throw new BadRequestException('wait publisher confirm')
    }

    if (isPublisher) accepted.publisher_cancel_confirmed_at = Date.now()
    if (isApplicant) accepted.applicant_cancel_confirmed_at = Date.now()

    if (accepted.publisher_cancel_confirmed_at && accepted.applicant_cancel_confirmed_at) {
      accepted.cancelled_at = Date.now()
      await this.demandsService.clearAcceptedApplication(demandId)
    }

    return {
      confirmed: true,
      cancelled: !!accepted.cancelled_at,
      application_id: accepted.id,
      schedule_status: accepted.cancelled_at ? 'cancelled' : 'cancel_pending',
      schedule_status_text: mapExtendedScheduleStatusText(accepted.cancelled_at ? 'cancelled' : 'cancel_pending')
    }
  }

  async listByDemand(demandId: number, userId: number) {
    const demand = await this.demandsService.getById(demandId)
    if (!demand) throw new NotFoundException('demand not found')
    if (demand.author_id !== userId) throw new BadRequestException('no permission')

    const list = applies
      .filter((a) => a.demand_id === demandId)
      .sort((a, b) => a.created_at - b.created_at)
      .map((item) => {
        const user = getStoredUserSummary(item.user_id)
        return {
          ...formatDemandApplicationSnapshot(demand.event_time, item),
          user: {
            id: item.user_id,
            nickname: user?.nickname || `用户${item.user_id}`,
            avatar: user?.avatar || ''
          }
        }
      })

    return { list }
  }

  async listByUser(userId: number) {
    const my = applies.filter(a => a.user_id === userId)
    const detailed = await Promise.all(
      my.map(async (a) => {
        const d = await this.demandsService.getById(a.demand_id)
        if (!d) return null
        return { ...d, ...formatDemandApplicationSnapshot(d.event_time, a) }
      })
    )
    return { list: detailed.filter(Boolean) }
  }
}
