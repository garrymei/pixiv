import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DemandApplicationService } from './demand-application.service'
import { DemandApplicationController } from './demand-application.controller'
import { AuthModule } from '../auth/auth.module'
import { DemandsModule } from '../demands/demands.module'
import { DemandApplication } from '../../database/entities/demand-application.entity'
import { User } from '../../database/entities/user.entity'

@Module({
  imports: [AuthModule, forwardRef(() => DemandsModule), TypeOrmModule.forFeature([DemandApplication, User])],
  providers: [DemandApplicationService],
  controllers: [DemandApplicationController],
  exports: [DemandApplicationService]
})
export class DemandApplicationModule {}
