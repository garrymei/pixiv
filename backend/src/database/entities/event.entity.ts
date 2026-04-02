import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { EventRegistration } from './event-registration.entity'
import { EventStatus } from '../../types/enums'

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 255 })
  title!: string

  @Column({ name: 'cover_url', length: 255, nullable: true })
  coverUrl?: string

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @OneToMany(() => EventRegistration, r => r.event)
  registrations!: EventRegistration[]
}
