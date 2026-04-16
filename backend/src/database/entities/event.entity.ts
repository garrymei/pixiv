import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { EventRegistration } from './event-registration.entity'
import { EventStatus } from '../../types/enums'

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 255 })
  title!: string

  @Column({ name: 'cover_image', length: 255, nullable: true })
  coverImage?: string

  @Column({ name: 'start_time', type: 'datetime', nullable: true })
  startTime?: Date

  @Column({ name: 'end_time', type: 'datetime', nullable: true })
  endTime?: Date

  @Column({ length: 128, nullable: true })
  location?: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number

  @Column({ length: 128, nullable: true })
  organizer?: string

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.UPCOMING })
  status!: EventStatus

  @Column({ name: 'event_type', length: 32, default: 'official' })
  eventType!: string

  @Column({ name: 'is_registerable', type: 'tinyint', width: 1, default: () => '1' })
  isRegisterable!: boolean

  @Column({ type: 'int', nullable: true })
  capacity?: number

  @Column({ name: 'registration_deadline', type: 'datetime', nullable: true })
  registrationDeadline?: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @OneToMany(() => EventRegistration, r => r.event)
  registrations!: EventRegistration[]
}
