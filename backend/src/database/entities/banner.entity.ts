import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 64, nullable: true })
  title!: string

  @Column({ name: 'image_url', length: 512 })
  imageUrl!: string

  @Column({ name: 'jump_link', length: 512, nullable: true })
  jumpLink?: string

  @Column({ length: 32, default: 'home_top' })
  position!: string

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number

  @Column({ type: 'tinyint', default: 1 })
  status!: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}
