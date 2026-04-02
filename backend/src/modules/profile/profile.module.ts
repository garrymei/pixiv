import { Module } from '@nestjs/common'
import { ProfileController } from './profile.controller'
import { ProfileService } from './profile.service'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { PostsModule } from '../posts/posts.module'
import { EventsModule } from '../events/events.module'
import { EventRegistrationModule } from '../event-registration/event-registration.module'
import { DemandsModule } from '../demands/demands.module'
import { DemandApplicationModule } from '../demand-application/demand-application.module'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PostsModule,
    EventsModule,
    EventRegistrationModule,
    DemandsModule,
    DemandApplicationModule
  ],
  controllers: [ProfileController],
  providers: [ProfileService]
})
export class ProfileModule {}
