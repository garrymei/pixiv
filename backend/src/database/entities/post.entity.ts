import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from './user.entity'
import { PostImage } from './post-image.entity'
import { Comment } from './comment.entity'
import { Like } from './like.entity'
import { ModerationStatus } from '../../types/enums'

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'author_id' })
  authorId!: number

  @ManyToOne(() => User, u => u.posts)
  @JoinColumn({ name: 'author_id' })
  author!: User

  @Column({ length: 255 })
  title!: string

  @Column({ type: 'text', nullable: true })
  content?: string

  @Column({ name: 'cover_image', length: 512, nullable: true })
  coverImage?: string

  @Column({ type: 'simple-json', nullable: true })
  tags?: string[]

  @Column({ name: 'tags_json', type: 'json', nullable: true })
  tagsJson?: string[] | null

  @Column({ length: 128, nullable: true })
  location?: string

  @Column({ name: 'post_type', length: 32, default: 'daily' })
  postType!: string

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount!: number

  @Column({ name: 'comment_count', type: 'int', default: 0 })
  commentCount!: number

  @Column({ name: 'moderation_status', type: 'enum', enum: ModerationStatus, default: ModerationStatus.APPROVED })
  moderationStatus!: ModerationStatus

  @Column({ name: 'moderation_reason', length: 255, nullable: true })
  moderationReason?: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @OneToMany(() => PostImage, i => i.post)
  images!: PostImage[]

  @OneToMany(() => Comment, c => c.post)
  comments!: Comment[]

  @OneToMany(() => Like, l => l.post)
  likes!: Like[]
}
