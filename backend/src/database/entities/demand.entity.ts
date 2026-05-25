import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from './user.entity'
import { DemandApplication } from './demand-application.entity'
import { DemandStatus, DemandType, ModerationStatus } from '../../types/enums'

@Entity('demands')
export class Demand {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'author_id' })
  authorId!: number

  @ManyToOne(() => User, u => u.demands)
  @JoinColumn({ name: 'author_id' })
  author!: User

  @Column({ name: 'demand_type', type: 'enum', enum: DemandType })
  demandType!: DemandType

  @Column({ name: 'accepted_application_id', type: 'bigint', nullable: true })
  acceptedApplicationId?: number | null

  @Column({ name: 'accepted_user_id', type: 'bigint', nullable: true })
  acceptedUserId?: number | null

  @Column({ length: 255 })
  title!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ length: 128, nullable: true })
  city?: string

  @Column({ length: 128, nullable: true })
  location?: string

  @Column({ name: 'event_time', type: 'datetime', nullable: true })
  eventTime?: Date

  @Column({ name: 'budget_type', length: 32, nullable: true })
  budgetType?: string

  @Column({ name: 'budget_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  budgetAmount?: number

  @Column({ name: 'participant_limit', type: 'int', default: 1 })
  participantLimit!: number

  @Column({ name: 'deadline', type: 'datetime', nullable: true })
  deadline?: Date

  @Column({ type: 'enum', enum: DemandStatus, default: DemandStatus.OPEN })
  status!: DemandStatus

  @Column({ name: 'time_change_requested_by', type: 'bigint', nullable: true })
  timeChangeRequestedBy?: number | null

  @Column({ name: 'requested_event_time', type: 'datetime', nullable: true })
  requestedEventTime?: Date | null

  @Column({ name: 'cancel_requested_by', type: 'bigint', nullable: true })
  cancelRequestedBy?: number | null

  @Column({ name: 'cancel_requested_at', type: 'datetime', nullable: true })
  cancelRequestedAt?: Date | null

  @Column({ name: 'cancelled_at', type: 'datetime', nullable: true })
  cancelledAt?: Date | null

  @Column({ name: 'moderation_status', type: 'enum', enum: ModerationStatus, default: ModerationStatus.APPROVED })
  moderationStatus!: ModerationStatus

  @Column({ name: 'moderation_reason', length: 255, nullable: true })
  moderationReason?: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @OneToMany(() => DemandApplication, a => a.demand)
  applications!: DemandApplication[]
}
