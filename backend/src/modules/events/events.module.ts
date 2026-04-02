import { Module, forwardRef } from '@nestjs/common'
import { EventsService } from './events.service'
import { EventsController } from './events.controller'
import { EventRegistrationModule } from '../event-registration/event-registration.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule, forwardRef(() => EventRegistrationModule)],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService]
})
export class EventsModule {}
