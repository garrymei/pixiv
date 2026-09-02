import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { PostsModule } from '../posts/posts.module'
import { DemandsModule } from '../demands/demands.module'
import { UsersModule } from '../users/users.module'
import { BannersModule } from '../banners/banners.module'
import { AppSettingsModule } from '../app-settings/app-settings.module'

@Module({
  imports: [PostsModule, DemandsModule, UsersModule, BannersModule, AppSettingsModule],
  controllers: [AdminController]
})
export class AdminModule {}
