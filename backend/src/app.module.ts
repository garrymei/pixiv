import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HealthController } from './modules/health/health.controller'
import { User } from './database/entities/user.entity'
import { Post } from './database/entities/post.entity'
import { PostImage } from './database/entities/post-image.entity'
import { Comment } from './database/entities/comment.entity'
import { Like } from './database/entities/like.entity'
import { Event } from './database/entities/event.entity'
import { EventRegistration } from './database/entities/event-registration.entity'
import { Demand } from './database/entities/demand.entity'
import { DemandApplication } from './database/entities/demand-application.entity'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { PostsModule } from './modules/posts/posts.module'
import { CommentsModule } from './modules/comments/comments.module'
import { LikesModule } from './modules/likes/likes.module'
import { EventsModule } from './modules/events/events.module'
import { EventRegistrationModule } from './modules/event-registration/event-registration.module'
import { DemandsModule } from './modules/demands/demands.module'
import { DemandApplicationModule } from './modules/demand-application/demand-application.module'
import { ProfileModule } from './modules/profile/profile.module'
import { UploadsModule } from './modules/uploads/uploads.module'

const hasDb =
  !!process.env.DB_HOST &&
  !!process.env.DB_PORT &&
  !!process.env.DB_NAME &&
  !!process.env.DB_USER &&
  !!process.env.DB_PASSWORD

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    LikesModule,
    EventsModule,
    EventRegistrationModule,
    DemandsModule,
    DemandApplicationModule,
    ProfileModule,
    UploadsModule,
    ...(hasDb
      ? [
          TypeOrmModule.forRootAsync({
            useFactory: () => ({
              type: 'mysql',
              host: process.env.DB_HOST,
              port: Number(process.env.DB_PORT || 3306),
              username: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_NAME,
              synchronize: false,
              entities: [User, Post, PostImage, Comment, Like, Event, EventRegistration, Demand, DemandApplication]
            })
          })
        ]
      : [])
  ],
  controllers: [HealthController],
  providers: []
})
export class AppModule {}
