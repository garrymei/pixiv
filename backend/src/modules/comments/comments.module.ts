import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommentsService } from './comments.service'
import { CommentsController } from './comments.controller'
import { AuthModule } from '../auth/auth.module'
import { Comment } from '../../database/entities/comment.entity'
import { Post } from '../../database/entities/post.entity'
import { User } from '../../database/entities/user.entity'

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Comment, Post, User])],
  providers: [CommentsService],
  controllers: [CommentsController]
})
export class CommentsModule {}
