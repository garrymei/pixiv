import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EventsService } from './events.service'
import { EventsController } from './events.controller'
import { EventRegistrationModule } from '../event-registration/event-registration.module'
import { AuthModule } from '../auth/auth.module'
import { Event } from '../../database/entities/event.entity'

@Module({
  imports: [AuthModule, forwardRef(() => EventRegistrationModule), TypeOrmModule.forFeature([Event])],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService]
})
export class EventsModule {}
