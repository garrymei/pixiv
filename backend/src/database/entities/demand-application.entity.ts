import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm'
import { Demand } from './demand.entity'
import { User } from './user.entity'
import { ApplicationStatus } from '../../types/enums'

@Entity('demand_applications')
@Unique(['demandId', 'userId'])
export class DemandApplication {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'demand_id' })
  demandId!: number

  @ManyToOne(() => Demand, d => d.applications)
  @JoinColumn({ name: 'demand_id' })
  demand!: Demand

  @Column({ name: 'user_id' })
  userId!: number

  @ManyToOne(() => User, u => u.demandApplications)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.APPLIED })
  status!: ApplicationStatus

  @Column({ name: 'apply_message', type: 'varchar', length: 512, nullable: true })
  applyMessage?: string

  @Column({ name: 'publisher_accepted_at', type: 'datetime', nullable: true })
  publisherAcceptedAt?: Date | null

  @Column({ name: 'applicant_confirmed_at', type: 'datetime', nullable: true })
  applicantConfirmedAt?: Date | null

  @Column({ name: 'cancel_requested_by', type: 'varchar', length: 16, nullable: true })
  cancelRequestedBy?: 'publisher' | 'applicant' | null

  @Column({ name: 'cancel_requested_at', type: 'datetime', nullable: true })
  cancelRequestedAt?: Date | null

  @Column({ name: 'publisher_cancel_confirmed_at', type: 'datetime', nullable: true })
  publisherCancelConfirmedAt?: Date | null

  @Column({ name: 'applicant_cancel_confirmed_at', type: 'datetime', nullable: true })
  applicantCancelConfirmedAt?: Date | null

  @Column({ name: 'cancelled_at', type: 'datetime', nullable: true })
  cancelledAt?: Date | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}
