import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DemandsService } from './demands.service'
import { DemandsController } from './demands.controller'
import { AuthModule } from '../auth/auth.module'
import { DemandApplicationModule } from '../demand-application/demand-application.module'
import { Demand } from '../../database/entities/demand.entity'
import { DemandApplication } from '../../database/entities/demand-application.entity'
import { User } from '../../database/entities/user.entity'
import { AppSettingsModule } from '../app-settings/app-settings.module'

@Module({
  imports: [AuthModule, AppSettingsModule, forwardRef(() => DemandApplicationModule), TypeOrmModule.forFeature([Demand, DemandApplication, User])],
  providers: [DemandsService],
  controllers: [DemandsController],
  exports: [DemandsService]
})
export class DemandsModule {}
