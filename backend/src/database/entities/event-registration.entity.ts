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

  @Column({ length: 32, default: 'registered' })
  status!: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark?: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
