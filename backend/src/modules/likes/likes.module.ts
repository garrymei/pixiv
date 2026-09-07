import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LikesService } from './likes.service'
import { LikesController } from './likes.controller'
import { AuthModule } from '../auth/auth.module'
import { AppSettingsModule } from '../app-settings/app-settings.module'
import { PostsModule } from '../posts/posts.module'
import { Like } from '../../database/entities/like.entity'
import { Post } from '../../database/entities/post.entity'

@Module({
  imports: [AuthModule, AppSettingsModule, PostsModule, TypeOrmModule.forFeature([Like, Post])],
  providers: [LikesService],
  controllers: [LikesController]
})
export class LikesModule {}
