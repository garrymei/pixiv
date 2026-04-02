import { Module } from '@nestjs/common'
import { LikesService } from './likes.service'
import { LikesController } from './likes.controller'
import { AuthModule } from '../auth/auth.module'
import { PostsModule } from '../posts/posts.module'

@Module({
  imports: [AuthModule, PostsModule],
  providers: [LikesService],
  controllers: [LikesController]
})
export class LikesModule {}
