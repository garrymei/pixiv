import { Injectable, BadRequestException, ForbiddenException, Inject, NotFoundException, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { EventsService } from '../events/events.service'
import { EventRegistration } from '../../database/entities/event-registration.entity'
import { User } from '../../database/entities/user.entity'

@Injectable()
export class EventRegistrationService {
  constructor(
    @Inject(forwardRef(() => EventsService)) private readonly eventsService: EventsService,
    @InjectRepository(EventRegistration)
    private readonly registrationsRepo: Repository<EventRegistration>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>
  ) {}

  async register(eventId: number, userId: number) {
    const event = await this.eventsService.getById(eventId)
    if (!event) throw new NotFoundException('event not found')
    if (!event.is_registerable) throw new ForbiddenException('not allow')
    if (event.registration_deadline && Date.now() > event.registration_deadline)
      throw new BadRequestException('deadline passed')
    const existing = await this.registrationsRepo.findOne({ where: { eventId, userId } })
    if (existing) throw new BadRequestException('already registered')
    const current = await this.registrationsRepo.count({ where: { eventId, registrationStatus: 1 } })
    if (event.capacity && current >= event.capacity) throw new BadRequestException('full')
    await this.registrationsRepo.save(this.registrationsRepo.create({ eventId, userId, registrationStatus: 1 }))
    return { registered: true }
  }

  async status(eventId: number, userId: number) {
    const existing = await this.registrationsRepo.findOne({ where: { eventId, userId, registrationStatus: 1 } })
    return { registered: !!existing }
  }

  async listByUser(userId: number) {
    const my = await this.registrationsRepo.find({ where: { userId, registrationStatus: 1 }, order: { createdAt: 'DESC', id: 'DESC' } })
    const detailed = await Promise.all(
      my.map(async (r) => {
        const ev = await this.eventsService.getById(r.eventId)
        if (!ev) return null
        return { ...ev, registered_at: r.createdAt?.getTime?.() || Date.now() }
      })
    )
    return { list: detailed.filter(Boolean) }
  }

  async listByEvent(eventId: number) {
    const event = await this.eventsService.getById(eventId)
    if (!event) throw new NotFoundException('event not found')

    const registrations = await this.registrationsRepo.find({
      where: { eventId, registrationStatus: 1 },
      order: { createdAt: 'DESC', id: 'DESC' }
    })
    const userIds = registrations.map((item) => item.userId)
    const users = userIds.length > 0 ? await this.usersRepo.find({ where: { id: In(userIds) } }) : []
    const userMap = new Map(users.map((user) => [user.id, user]))
    const list = registrations.map((item) => {
      const user = userMap.get(item.userId)
      return {
        user_id: item.userId,
        nickname: user?.nickname || `用户${item.userId}`,
        avatar: user?.avatarUrl || '',
        city: user?.city || '',
        role_type: user?.roleType || 'user',
        registered_at: item.createdAt?.getTime?.() || Date.now()
      }
    })

    return { event_id: eventId, total: list.length, list }
  }
}
