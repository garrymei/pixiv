import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { PostsService } from '../posts/posts.service'
import { EventRegistrationService } from '../event-registration/event-registration.service'
import { DemandsService } from '../demands/demands.service'
import { DemandApplicationService } from '../demand-application/demand-application.service'

@Injectable()
export class ProfileService {
  constructor(
    private readonly users: UsersService,
    private readonly posts: PostsService,
    private readonly registrations: EventRegistrationService,
    private readonly demands: DemandsService,
    private readonly demandApps: DemandApplicationService
  ) {}

  async summary(userId: number) {
    const user = await this.users.getCurrentUser(userId)
    const postsRes = await this.posts.listMine(userId, 1, 1)
    const eventsRes = await this.registrations.listByUser(userId)
    const demandsRes = await this.demands.listMine(userId, 1, 1)
    const demandAppsRes = await this.demandApps.listByUser(userId)
    const scheduledDemandsCount = await this.demands.countMineWithApplications(userId)
    const eventsCount = (eventsRes.list || []).length
    const demandApplicationsCount = (demandAppsRes.list || []).length
    return {
      user,
      postsCount: postsRes.total,
      eventsCount,
      demandsCount: demandsRes.total,
      demandApplicationsCount,
      participationCount: eventsCount + demandApplicationsCount + scheduledDemandsCount
    }
  }
}
