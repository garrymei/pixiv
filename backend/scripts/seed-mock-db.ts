import 'reflect-metadata'
import 'dotenv/config'
import { DataSource } from 'typeorm'

import { User } from '../src/database/entities/user.entity'
import { Post } from '../src/database/entities/post.entity'
import { PostImage } from '../src/database/entities/post-image.entity'
import { Comment } from '../src/database/entities/comment.entity'
import { Like } from '../src/database/entities/like.entity'
import { Event } from '../src/database/entities/event.entity'
import { EventRegistration } from '../src/database/entities/event-registration.entity'
import { Demand } from '../src/database/entities/demand.entity'
import { DemandApplication } from '../src/database/entities/demand-application.entity'
import { Banner } from '../src/database/entities/banner.entity'

import { currentUser, mockUsers } from '../../src/mocks/user'
import { mockPosts } from '../../src/mocks/posts'
import { mockComments } from '../../src/mocks/comments'
import { mockEvents } from '../../src/mocks/events'
import { mockDemands } from '../../src/mocks/demands'
import { mockBanners } from '../../src/mocks/banners'
import { EventStatus, DemandStatus, DemandType, ApplicationStatus } from '../src/types/enums'

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env: ${name}`)
  return value
}

function numericId(value: string | number) {
  const raw = String(value)
  const match = raw.match(/\d+/g)
  if (!match) throw new Error(`Cannot parse numeric id from: ${value}`)
  return Number(match[match.length - 1])
}

function asDate(value?: string) {
  return value ? new Date(value) : new Date()
}

function eventStatusFromMock(status: string) {
  if (status === 'ongoing') return EventStatus.ONGOING
  if (status === 'ended') return EventStatus.ENDED
  return EventStatus.UPCOMING
}

function buildEventSchedule(id: number) {
  const map: Record<number, { start?: Date; end?: Date; deadline?: Date; eventType: string; isRegisterable: boolean; capacity?: number; description: string }> = {
    1: {
      start: new Date('2026-08-15T09:00:00+08:00'),
      end: new Date('2026-08-17T18:00:00+08:00'),
      eventType: 'info',
      isRegisterable: false,
      description: '年度大型动漫展，含舞台、签售、宅舞与同人摊位。'
    },
    2: {
      start: new Date('2026-04-20T14:00:00+08:00'),
      end: new Date('2026-04-20T18:00:00+08:00'),
      deadline: new Date('2026-04-19T23:59:59+08:00'),
      eventType: 'official',
      isRegisterable: true,
      capacity: 50,
      description: '适合扩列、面基与线下交流的官方活动。'
    },
    3: {
      start: new Date('2025-12-24T19:30:00+08:00'),
      end: new Date('2025-12-24T22:00:00+08:00'),
      eventType: 'info',
      isRegisterable: false,
      description: '周年纪念演出活动。'
    },
    4: {
      start: new Date('2026-10-01T10:00:00+08:00'),
      end: new Date('2026-10-03T18:00:00+08:00'),
      eventType: 'info',
      isRegisterable: false,
      description: '同城国漫主题嘉年华活动。'
    },
    5: {
      start: new Date('2026-05-20T10:00:00+08:00'),
      end: new Date('2026-05-20T18:00:00+08:00'),
      eventType: 'info',
      isRegisterable: false,
      description: '周边和谷子线下交易交流会。'
    }
  }
  return map[id]
}

function demandTypeFromMock(type: string) {
  const normalized = type.replace(/^(找|本)/, '')
  if (normalized === '摄影') return DemandType.PHOTOGRAPHY
  if (normalized === '妆娘' || normalized === '毛娘') return DemandType.MAKEUP
  if (normalized.toLowerCase() === 'coser') return DemandType.COSER
  if (normalized === '后期') return DemandType.RETOUCH
  return DemandType.OTHER
}

function demandBudget(input?: string) {
  if (!input) return { budgetType: null as string | null, budgetAmount: null as number | null }
  if (input.includes('无偿')) return { budgetType: 'free', budgetAmount: null }
  if (input.includes('互勉')) return { budgetType: 'exchange', budgetAmount: null }
  if (input.includes('面议')) return { budgetType: 'negotiable', budgetAmount: null }
  const numbers = input.match(/\d+/g)?.map(Number) || []
  return {
    budgetType: 'fixed',
    budgetAmount: numbers.length ? numbers[numbers.length - 1] : null
  }
}

function demandLimit(input?: string) {
  if (!input) return 1
  const numbers = input.match(/\d+/g)?.map(Number) || []
  return numbers.length ? numbers[numbers.length - 1] : 1
}

function buildDemandSchedule(id: number) {
  const map: Record<number, { eventTime?: Date; deadline?: Date }> = {
    1: { eventTime: new Date('2026-04-19T14:00:00+08:00'), deadline: new Date('2026-04-18T23:59:59+08:00') },
    2: { eventTime: new Date('2026-05-01T07:00:00+08:00'), deadline: new Date('2026-04-28T23:59:59+08:00') },
    3: { eventTime: new Date('2026-05-18T15:00:00+08:00'), deadline: new Date('2026-05-10T23:59:59+08:00') },
    4: { eventTime: new Date('2026-04-20T13:00:00+08:00'), deadline: new Date('2026-04-18T23:59:59+08:00') },
    5: { eventTime: new Date('2026-04-18T10:00:00+08:00'), deadline: new Date('2026-04-17T23:59:59+08:00') }
  }
  return map[id]
}

const userSeeds = [
  {
    id: numericId(currentUser.id),
    nickname: currentUser.nickname,
    avatarUrl: currentUser.avatarUrl,
    bgUrl: currentUser.bgUrl,
    bio: currentUser.bio,
    city: '广州',
    roleType: 'official',
    followersCount: currentUser.followersCount,
    followingCount: currentUser.followingCount
  },
  {
    id: numericId(mockUsers.u_1002.id),
    nickname: mockUsers.u_1002.nickname,
    avatarUrl: mockUsers.u_1002.avatarUrl,
    bio: '广州同城 Coser，欢迎约拍扩列。',
    city: '广州',
    roleType: 'user',
    followersCount: mockUsers.u_1002.followersCount,
    followingCount: mockUsers.u_1002.followingCount
  },
  {
    id: numericId(mockUsers.u_1003.id),
    nickname: mockUsers.u_1003.nickname,
    avatarUrl: mockUsers.u_1003.avatarUrl,
    bio: '接寄拍/场照/正片，风格看主页，返图快。',
    city: '广州',
    roleType: 'user',
    followersCount: mockUsers.u_1003.followersCount,
    followingCount: mockUsers.u_1003.followingCount
  },
  {
    id: 1004,
    nickname: '手工大佬',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Craft',
    bio: '手作、道具、教程分享中。',
    city: '深圳',
    roleType: 'user',
    followersCount: 1200,
    followingCount: 80
  },
  {
    id: 1005,
    nickname: '社团团长',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Team',
    bio: '社团招新，欢迎同好加入。',
    city: '深圳',
    roleType: 'user',
    followersCount: 680,
    followingCount: 115
  },
  {
    id: 1006,
    nickname: '美妆小天才',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Makeup',
    bio: '赛博朋克妆面研究中。',
    city: '广州',
    roleType: 'user',
    followersCount: 420,
    followingCount: 64
  }
]

async function main() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: requiredEnv('DB_HOST'),
    port: Number(requiredEnv('DB_PORT')),
    username: requiredEnv('DB_USER'),
    password: requiredEnv('DB_PASSWORD'),
    database: requiredEnv('DB_NAME'),
    synchronize: true,
    logging: false,
    entities: [User, Post, PostImage, Comment, Like, Event, EventRegistration, Demand, DemandApplication, Banner]
  })

  await dataSource.initialize()

  const userRepo = dataSource.getRepository(User)
  const postRepo = dataSource.getRepository(Post)
  const postImageRepo = dataSource.getRepository(PostImage)
  const commentRepo = dataSource.getRepository(Comment)
  const likeRepo = dataSource.getRepository(Like)
  const eventRepo = dataSource.getRepository(Event)
  const eventRegistrationRepo = dataSource.getRepository(EventRegistration)
  const demandRepo = dataSource.getRepository(Demand)
  const demandApplicationRepo = dataSource.getRepository(DemandApplication)
  const bannerRepo = dataSource.getRepository(Banner)

  await userRepo.save(userSeeds.map((item) => userRepo.create(item)))

  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0')
  await postImageRepo.clear()
  await commentRepo.clear()
  await likeRepo.clear()
  await eventRegistrationRepo.clear()
  await demandApplicationRepo.clear()
  await postRepo.clear()
  await eventRepo.clear()
  await demandRepo.clear()
  await bannerRepo.clear()
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1')

  const posts = mockPosts.map((item) => {
    const id = numericId(item.id)
    return postRepo.create({
      id,
      authorId: numericId(item.authorId),
      title: item.title,
      content: item.content || item.title,
      coverImage: item.coverUrl,
      tags: item.tags,
      location: item.tags.includes('广州') || item.tags.includes('广州场照') ? '广州' : item.tags.includes('深圳') ? '深圳' : '',
      postType: item.tags.includes('日常') ? 'daily' : 'work',
      likeCount: item.likeCount,
      commentCount: item.commentCount,
      createdAt: asDate(item.createTime),
      updatedAt: asDate(item.createTime)
    })
  })
  await postRepo.save(posts)

  const postImages = mockPosts.flatMap((item, index) => {
    const images = item.images && item.images.length ? item.images : [item.coverUrl]
    return images.map((imageUrl, imageIndex) =>
      postImageRepo.create({
        postId: numericId(item.id),
        imageUrl,
        sortOrder: imageIndex
      })
    )
  })
  await postImageRepo.save(postImages)

  const comments = mockComments.map((item, index) => {
    const createdAt = new Date(Date.now() - (index + 2) * 60 * 60 * 1000)
    return commentRepo.create({
      id: numericId(item.id),
      postId: numericId(item.postId),
      authorId: numericId(item.authorId),
      content: item.content,
      likeCount: item.likeCount,
      replyCount: item.replyCount,
      createdAt
    })
  })
  await commentRepo.save(comments)

  await likeRepo.save([
    likeRepo.create({ postId: 1, userId: 1 }),
    likeRepo.create({ postId: 1, userId: 1003 }),
    likeRepo.create({ postId: 2, userId: 1002 }),
    likeRepo.create({ postId: 5, userId: 1002 })
  ])

  const events = mockEvents.map((item) => {
    const id = numericId(item.id)
    const schedule = buildEventSchedule(id)
    return eventRepo.create({
      id,
      title: item.title,
      coverImage: item.coverUrl,
      startTime: schedule?.start,
      endTime: schedule?.end,
      location: item.location,
      description: schedule?.description || item.title,
      price: item.price ? Number(item.price.replace(/[^\d.]/g, '')) || 0 : 0,
      organizer: item.organizer,
      status: eventStatusFromMock(item.status),
      eventType: schedule?.eventType || 'info',
      isRegisterable: schedule?.isRegisterable ?? false,
      capacity: schedule?.capacity,
      registrationDeadline: schedule?.deadline
    })
  })
  await eventRepo.save(events)

  await eventRegistrationRepo.save([
    eventRegistrationRepo.create({
      eventId: 2,
      userId: 1,
      status: 'registered',
      remark: '当前小程序 mock 的“我的活动”示例数据'
    })
  ])

  const demands = mockDemands.map((item) => {
    const id = numericId(item.id)
    const schedule = buildDemandSchedule(id)
    const budget = demandBudget(item.budget)
    return demandRepo.create({
      id,
      authorId: numericId(item.authorId),
      type: demandTypeFromMock(item.type),
      title: item.title,
      description: item.content || item.title,
      city: item.location || '',
      location: item.location || '',
      eventTime: schedule?.eventTime,
      budgetType: budget.budgetType || undefined,
      budgetValue: budget.budgetAmount ?? undefined,
      peopleCount: demandLimit(item.type === 'Coser' ? '1人' : undefined),
      deadline: schedule?.deadline,
      status: item.status === 'closed' ? DemandStatus.CLOSED : DemandStatus.OPEN,
      createdAt: asDate(item.createTime),
      updatedAt: asDate(item.createTime)
    })
  })
  await demandRepo.save(demands)

  await demandApplicationRepo.save([
    demandApplicationRepo.create({
      demandId: 1,
      userId: 1003,
      status: ApplicationStatus.APPLIED,
      remark: '示例报名记录'
    })
  ])

  const banners = mockBanners.map((item, index) =>
    bannerRepo.create({
      id: numericId(item.id),
      title: item.title,
      subtitle: item.subtitle,
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl,
      sortOrder: index,
      isActive: true
    })
  )
  await bannerRepo.save(banners)

  console.log(
    JSON.stringify(
      {
        ok: true,
        database: process.env.DB_NAME,
        counts: {
          users: userSeeds.length,
          posts: posts.length,
          postImages: postImages.length,
          comments: comments.length,
          likes: 4,
          events: events.length,
          eventRegistrations: 1,
          demands: demands.length,
          demandApplications: 1,
          banners: banners.length
        }
      },
      null,
      2
    )
  )

  await dataSource.destroy()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
