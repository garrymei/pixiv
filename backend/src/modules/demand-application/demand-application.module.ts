import { Module, forwardRef } from '@nestjs/common'
import { DemandApplicationService } from './demand-application.service'
import { DemandApplicationController } from './demand-application.controller'
import { AuthModule } from '../auth/auth.module'
import { DemandsModule } from '../demands/demands.module'

@Module({
  imports: [AuthModule, forwardRef(() => DemandsModule)],
  providers: [DemandApplicationService],
  controllers: [DemandApplicationController],
  exports: [DemandApplicationService]
})
export class DemandApplicationModule {}
