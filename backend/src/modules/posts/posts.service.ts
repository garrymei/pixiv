import { ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { CreatePostDto } from './dto/create-post.dto'
import { autoModerate } from '../../common/utils/moderation'
import { ModerationStatus } from '../../types/enums'
import { Post } from '../../database/entities/post.entity'
import { PostImage } from '../../database/entities/post-image.entity'
import { User } from '../../database/entities/user.entity'

type PostResponse = {
  id: number
  author_id: number
  title: string
  content: string
  post_type: 'work' | 'daily'
  cover_image: string
  images: string[]
  tags: string[]
  location: string
  created_at: number
  like_count: number
  comment_count: number
  moderation_status: ModerationStatus
  moderation_reason: string
  user: {
    id: number
    nickname: string
    avatar: string
  }
}

const POST_SUBMISSION_TTL = 5000
const recentPostSubmissions = new Map<string, number>()

function buildPostSubmissionKey(authorId: number, dto: CreatePostDto) {
  return JSON.stringify({
    authorId,
    title: dto.title.trim(),
    content: (dto.content || '').trim(),
    post_type: dto.post_type,
    cover_image: dto.cover_image || '',
    images: (dto.images || []).filter(Boolean),
    location: (dto.location || '').trim(),
    tags: (dto.tags || []).filter(Boolean)
  })
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    @InjectRepository(PostImage)
    private readonly postImagesRepo: Repository<PostImage>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>
  ) {}

  private normalizeTags(post: Post) {
    if (Array.isArray(post.tagsJson)) return post.tagsJson.filter(Boolean)
    if (Array.isArray(post.tags)) return post.tags.filter(Boolean)
    if (typeof post.tags === 'string') {
      try {
        const parsed = JSON.parse(post.tags)
        return Array.isArray(parsed) ? parsed.filter(Boolean) : []
      } catch {
        return []
      }
    }
    return []
  }

  private async buildResponse(items: Post[]): Promise<PostResponse[]> {
    if (items.length === 0) return []
    const postIds = items.map((item) => item.id)
    const authorIds = Array.from(new Set(items.map((item) => item.authorId)))
    const [images, users] = await Promise.all([
      this.postImagesRepo.find({ where: { postId: In(postIds) }, order: { sortOrder: 'ASC', id: 'ASC' } }),
      this.usersRepo.find({ where: { id: In(authorIds) } })
    ])
    const imageMap = new Map<number, string[]>()
    for (const image of images) {
      const list = imageMap.get(image.postId) || []
      list.push(image.imageUrl)
      imageMap.set(image.postId, list)
    }
    const userMap = new Map(users.map((user) => [user.id, user]))

    return items.map((item) => {
      const user = userMap.get(item.authorId)
      const itemImages = imageMap.get(item.id) || []
      const tags = this.normalizeTags(item)
      return {
        id: item.id,
        author_id: item.authorId,
        title: item.title || '',
        content: item.content || '',
        post_type: item.postType as 'work' | 'daily',
        cover_image: item.coverImage || itemImages[0] || '',
        images: itemImages,
        tags,
        location: item.location || '',
        created_at: item.createdAt?.getTime?.() || Date.now(),
        like_count: item.likeCount || 0,
        comment_count: item.commentCount || 0,
        moderation_status: item.moderationStatus,
        moderation_reason: item.moderationReason || '',
        user: {
          id: item.authorId,
          nickname: user?.nickname || `用户${item.authorId}`,
          avatar: user?.avatarUrl || ''
        }
      }
    })
  }

  async list(params: { type?: 'work' | 'daily'; page?: number; pageSize?: number }) {
    const { type, page = 1, pageSize = 10 } = params || {}
    const where = {
      moderationStatus: ModerationStatus.APPROVED,
      ...(type ? { postType: type } : {})
    }
    const [items, total] = await this.postsRepo.findAndCount({
      where,
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
    const data = await this.buildResponse(items)
    return { list: data, total, page, pageSize }
  }

  async listForAdmin(params: { status?: ModerationStatus; page?: number; pageSize?: number }) {
    const { status, page = 1, pageSize = 20 } = params || {}
    const [items, total] = await this.postsRepo.findAndCount({
      where: status ? { moderationStatus: status } : {},
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
    const data = await this.buildResponse(items)
    return { list: data, total, page, pageSize }
  }

  async getById(id: number) {
    const item = await this.postsRepo.findOne({ where: { id } })
    if (!item || item.moderationStatus !== ModerationStatus.APPROVED) return null
    const [data] = await this.buildResponse([item])
    return data || null
  }

  async create(authorId: number, dto: CreatePostDto) {
    const now = Date.now()
    const submissionKey = buildPostSubmissionKey(authorId, dto)
    const recentSubmitAt = recentPostSubmissions.get(submissionKey)
    if (recentSubmitAt && now - recentSubmitAt < POST_SUBMISSION_TTL) {
      throw new ConflictException('duplicate submit')
    }
    const images = (dto.images || []).filter(Boolean)
    const tags = (dto.tags || []).filter(Boolean)
    const review = autoModerate({
      text: `${dto.title}\n${dto.content || ''}\n${(dto.tags || []).join(' ')}\n${dto.location || ''}`,
      images: images.length > 0 ? images : (dto.cover_image ? [dto.cover_image] : [])
    })
    const entity = await this.postsRepo.save(this.postsRepo.create({
      authorId,
      title: dto.title.trim(),
      content: dto.content?.trim() || '',
      postType: dto.post_type,
      coverImage: dto.cover_image || images[0] || '',
      tags,
      tagsJson: tags,
      location: dto.location?.trim() || '',
      likeCount: 0,
      commentCount: 0,
      moderationStatus: review.status,
      moderationReason: review.reason || ''
    }))

    if (images.length > 0) {
      await this.postImagesRepo.save(images.map((imageUrl, index) => this.postImagesRepo.create({
        postId: entity.id,
        imageUrl,
        sortOrder: index
      })))
    }
    recentPostSubmissions.set(submissionKey, now)
    const [data] = await this.buildResponse([entity])
    return data
  }

  async listMine(authorId: number, page = 1, pageSize = 10) {
    const [items, total] = await this.postsRepo.findAndCount({
      where: { authorId },
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
    const data = await this.buildResponse(items)
    return { list: data, total, page, pageSize }
  }

  async review(id: number, action: 'approve' | 'reject', reason?: string) {
    const item = await this.postsRepo.findOne({ where: { id } })
    if (!item) return null
    item.moderationStatus = action === 'approve' ? ModerationStatus.APPROVED : ModerationStatus.REJECTED
    item.moderationReason = action === 'approve' ? '' : (reason || '内容审核未通过')
    const saved = await this.postsRepo.save(item)
    const [data] = await this.buildResponse([saved])
    return data || null
  }
}
