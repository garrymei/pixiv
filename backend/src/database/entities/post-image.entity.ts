import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Post } from './post.entity'

@Entity('post_images')
export class PostImage {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'post_id' })
  postId!: number

  @ManyToOne(() => Post, p => p.images)
  post!: Post

  @Column({ name: 'image_url', length: 255 })
  imageUrl!: string

  @Column({ name: 'sort_order', default: 0 })
  sortOrder!: number
}
