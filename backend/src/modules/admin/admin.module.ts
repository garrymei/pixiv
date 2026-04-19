import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { PostsModule } from '../posts/posts.module'
import { DemandsModule } from '../demands/demands.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [PostsModule, DemandsModule, UsersModule],
  controllers: [AdminController]
})
export class AdminModule {}
