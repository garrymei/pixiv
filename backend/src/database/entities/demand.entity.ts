import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from './user.entity'
import { DemandApplication } from './demand-application.entity'
import { DemandStatus, DemandType } from '../../types/enums'

@Entity('demands')
export class Demand {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'author_id' })
  authorId!: number

  @ManyToOne(() => User, u => u.demands)
  author!: User

  @Column({ type: 'enum', enum: DemandType })
  type!: DemandType

  @Column({ length: 255 })
  title!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ name: 'time', type: 'datetime', nullable: true })
  time?: Date

  @Column({ length: 128, nullable: true })
  location?: string

  @Column({ name: 'budget_type', length: 32, nullable: true })
  budgetType?: string

  @Column({ name: 'budget_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  budgetValue?: number

  @Column({ name: 'people_count', type: 'int', default: 1 })
  peopleCount!: number

  @Column({ type: 'enum', enum: DemandStatus, default: DemandStatus.OPEN })
  status!: DemandStatus

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @OneToMany(() => DemandApplication, a => a.demand)
  applications!: DemandApplication[]
}
