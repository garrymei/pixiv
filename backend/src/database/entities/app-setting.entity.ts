import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('app_settings')
export class AppSetting {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'publish_enabled', type: 'tinyint', default: 0 })
  publishEnabled!: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}
