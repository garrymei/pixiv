import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Post } from './post.entity'
import { User } from './user.entity'

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'post_id' })
  postId!: number

  @ManyToOne(() => Post, p => p.comments)
  post!: Post

  @Column({ name: 'author_id' })
  authorId!: number

  @ManyToOne(() => User, u => u.comments)
  author!: User

  @Column({ type: 'text' })
  content!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
