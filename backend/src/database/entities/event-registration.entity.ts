import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm'
import { Event } from './event.entity'
import { User } from './user.entity'

@Entity('event_registrations')
@Unique(['eventId', 'userId'])
export class EventRegistration {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'event_id' })
  eventId!: number

  @ManyToOne(() => Event, e => e.registrations)
  @JoinColumn({ name: 'event_id' })
  event!: Event

  @Column({ name: 'user_id' })
  userId!: number

  @ManyToOne(() => User, u => u.eventRegistrations)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ name: 'form_data_json', type: 'json', nullable: true })
  formDataJson?: Record<string, unknown> | null

  @Column({ name: 'registration_status', type: 'tinyint', default: 1 })
  registrationStatus!: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}
