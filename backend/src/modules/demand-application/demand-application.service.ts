import { Injectable, BadRequestException, Inject, NotFoundException, forwardRef } from '@nestjs/common'
import { DemandsService } from '../demands/demands.service'
import { DemandStatus } from '../../types/enums'

type DemandApplyItem = {
  demand_id: number
  user_id: number
  created_at: number
}

const applies: DemandApplyItem[] = [
  { demand_id: 1, user_id: 1003, created_at: new Date('2024-03-24T17:00:00Z').getTime() },
  { demand_id: 4, user_id: 1003, created_at: new Date('2024-03-22T13:00:00Z').getTime() },
  { demand_id: 2, user_id: 1002, created_at: new Date('2024-03-23T23:00:00Z').getTime() }
]

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
    const current = applies.filter(a => a.demand_id === demandId).length
    if (demand.participant_limit && current >= demand.participant_limit) throw new BadRequestException('full')
    const item = { demand_id: demandId, user_id: userId, created_at: Date.now() }
    applies.push(item)
    return { applied: true }
  }

  async status(demandId: number, userId: number) {
    const existing = applies.find(a => a.demand_id === demandId && a.user_id === userId)
    return { applied: !!existing }
  }

  async listByUser(userId: number) {
    const my = applies.filter(a => a.user_id === userId)
    const detailed = await Promise.all(
      my.map(async (a) => {
        const d = await this.demandsService.getById(a.demand_id)
        if (!d) return null
        return { ...d, applied_at: a.created_at }
      })
    )
    return { list: detailed.filter(Boolean) }
  }
}
