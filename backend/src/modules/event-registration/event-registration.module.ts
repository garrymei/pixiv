import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EventRegistrationService } from './event-registration.service'
import { EventRegistrationController } from './event-registration.controller'
import { AuthModule } from '../auth/auth.module'
import { EventsModule } from '../events/events.module'
import { EventRegistration } from '../../database/entities/event-registration.entity'
import { User } from '../../database/entities/user.entity'

@Module({
  imports: [AuthModule, forwardRef(() => EventsModule), TypeOrmModule.forFeature([EventRegistration, User])],
  providers: [EventRegistrationService],
  controllers: [EventRegistrationController],
  exports: [EventRegistrationService]
})
export class EventRegistrationModule {}
