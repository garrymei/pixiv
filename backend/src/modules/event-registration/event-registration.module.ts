import { Module, forwardRef } from '@nestjs/common'
import { EventRegistrationService } from './event-registration.service'
import { EventRegistrationController } from './event-registration.controller'
import { AuthModule } from '../auth/auth.module'
import { EventsModule } from '../events/events.module'

@Module({
  imports: [AuthModule, forwardRef(() => EventsModule)],
  providers: [EventRegistrationService],
  controllers: [EventRegistrationController],
  exports: [EventRegistrationService]
})
export class EventRegistrationModule {}
