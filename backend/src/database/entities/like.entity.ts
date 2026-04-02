import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { Post } from './post.entity'
import { User } from './user.entity'

@Entity('likes')
@Unique(['postId', 'userId'])
export class Like {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'post_id' })
  postId!: number

  @ManyToOne(() => Post, p => p.likes)
  post!: Post

  @Column({ name: 'user_id' })
  userId!: number

  @ManyToOne(() => User, u => u.likes)
  user!: User

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
