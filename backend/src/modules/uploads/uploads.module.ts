import { Module } from '@nestjs/common'
import { UploadsController } from './uploads.controller'
import { UploadsService } from './uploads.service'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [AuthModule, ConfigModule],
  controllers: [UploadsController],
  providers: [UploadsService]
})
export class UploadsModule {}
