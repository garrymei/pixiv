import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PostsService } from './posts.service'
import { PostsController } from './posts.controller'
import { AuthModule } from '../auth/auth.module'
import { Post } from '../../database/entities/post.entity'
import { PostImage } from '../../database/entities/post-image.entity'
import { User } from '../../database/entities/user.entity'
import { UploadsModule } from '../uploads/uploads.module'
import { AppSettingsModule } from '../app-settings/app-settings.module'

@Module({
  imports: [AuthModule, UploadsModule, AppSettingsModule, TypeOrmModule.forFeature([Post, PostImage, User])],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService]
})
export class PostsModule {}
