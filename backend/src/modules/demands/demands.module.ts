import { Module, forwardRef } from '@nestjs/common'
import { DemandsService } from './demands.service'
import { DemandsController } from './demands.controller'
import { AuthModule } from '../auth/auth.module'
import { DemandApplicationModule } from '../demand-application/demand-application.module'

@Module({
  imports: [AuthModule, forwardRef(() => DemandApplicationModule)],
  providers: [DemandsService],
  controllers: [DemandsController],
  exports: [DemandsService]
})
export class DemandsModule {}
