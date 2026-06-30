import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Venue } from '../../database/entities/venue.entity'
import { VenueBooking } from '../../database/entities/venue-booking.entity'
import { VenueScene } from '../../database/entities/venue-scene.entity'
import { AuthModule } from '../auth/auth.module'
import { VenuesController } from './venues.controller'
import { VenuesService } from './venues.service'

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Venue, VenueScene, VenueBooking])],
  controllers: [VenuesController],
  providers: [VenuesService],
  exports: [VenuesService]
})
export class VenuesModule {}
