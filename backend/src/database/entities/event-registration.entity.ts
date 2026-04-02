import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'
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
  event!: Event

  @Column({ name: 'user_id' })
  userId!: number

  @ManyToOne(() => User, u => u.eventRegistrations)
  user!: User

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
