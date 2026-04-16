import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 128 })
  title!: string

  @Column({ length: 255, nullable: true })
  subtitle?: string

  @Column({ name: 'image_url', length: 255 })
  imageUrl!: string

  @Column({ name: 'link_url', length: 255, nullable: true })
  linkUrl?: string

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: () => '1' })
  isActive!: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}
