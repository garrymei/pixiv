import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from './user.entity'
import { Venue } from './venue.entity'
import { VenueScene } from './venue-scene.entity'

@Entity('venue_bookings')
export class VenueBooking {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'venue_id' })
  venueId!: number

  @ManyToOne(() => Venue, venue => venue.bookings)
  @JoinColumn({ name: 'venue_id' })
  venue!: Venue

  @Column({ name: 'scene_id' })
  sceneId!: number

  @ManyToOne(() => VenueScene, scene => scene.bookings)
  @JoinColumn({ name: 'scene_id' })
  scene!: VenueScene

  @Column({ name: 'user_id' })
  userId!: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ name: 'start_time', type: 'datetime' })
  startTime!: Date

  @Column({ name: 'end_time', type: 'datetime' })
  endTime!: Date

  @Column({ length: 255, nullable: true })
  note?: string

  @Column({ length: 16, default: 'CONFIRMED' })
  status!: 'CONFIRMED' | 'CANCELLED'

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}
