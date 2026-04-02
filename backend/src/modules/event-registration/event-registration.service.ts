import { Injectable, BadRequestException, ForbiddenException, Inject, NotFoundException, forwardRef } from '@nestjs/common'
import { EventsService } from '../events/events.service'

type RegistrationItem = {
  event_id: number
  user_id: number
  created_at: number
}

const registrations: RegistrationItem[] = []

@Injectable()
export class EventRegistrationService {
  constructor(@Inject(forwardRef(() => EventsService)) private readonly eventsService: EventsService) {}

  async register(eventId: number, userId: number) {
    const event = await this.eventsService.getById(eventId)
    if (!event) throw new NotFoundException('event not found')
    if (event.event_type !== 'official') throw new ForbiddenException('not allow')
    if (event.registration_deadline && Date.now() > event.registration_deadline)
      throw new BadRequestException('deadline passed')
    const existing = registrations.find(r => r.event_id === eventId && r.user_id === userId)
    if (existing) throw new BadRequestException('already registered')
    const current = registrations.filter(r => r.event_id === eventId).length
    if (event.capacity && current >= event.capacity) throw new BadRequestException('full')
    const item = { event_id: eventId, user_id: userId, created_at: Date.now() }
    registrations.push(item)
    return { registered: true }
  }

  async status(eventId: number, userId: number) {
    const existing = registrations.find(r => r.event_id === eventId && r.user_id === userId)
    return { registered: !!existing }
  }

  async listByUser(userId: number) {
    const my = registrations.filter(r => r.user_id === userId)
    const detailed = await Promise.all(
      my.map(async (r) => {
        const ev = await this.eventsService.getById(r.event_id)
        if (!ev) return null
        return { ...ev, registered_at: r.created_at }
      })
    )
    return { list: detailed.filter(Boolean) }
  }
}
