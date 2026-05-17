import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Post } from './post.entity'
import { User } from './user.entity'

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'post_id' })
  postId!: number

  @ManyToOne(() => Post, p => p.comments)
  @JoinColumn({ name: 'post_id' })
  post!: Post

  @Column({ name: 'author_id' })
  authorId!: number

  @ManyToOne(() => User, u => u.comments)
  @JoinColumn({ name: 'author_id' })
  author!: User

  @Column({ type: 'text' })
  content!: string

  @Column({ name: 'parent_id', type: 'bigint', nullable: true })
  parentId?: number

  @Column({ name: 'reply_user_id', type: 'bigint', nullable: true })
  replyUserId?: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
