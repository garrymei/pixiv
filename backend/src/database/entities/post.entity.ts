import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from './user.entity'
import { PostImage } from './post-image.entity'
import { Comment } from './comment.entity'
import { Like } from './like.entity'

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'author_id' })
  authorId!: number

  @ManyToOne(() => User, u => u.posts)
  author!: User

  @Column({ length: 255 })
  title!: string

  @Column({ type: 'text', nullable: true })
  content?: string

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
