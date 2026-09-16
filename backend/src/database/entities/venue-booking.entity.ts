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

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId?: number | null

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User | null

  @Column({ name: 'booking_type', length: 16, default: 'USER' })
  bookingType!: 'USER' | 'ADMIN' | 'BLOCKED'

  @Column({ name: 'customer_name', type: 'varchar', length: 64, nullable: true })
  customerName?: string | null

  @Column({ name: 'customer_phone', type: 'varchar', length: 32, nullable: true })
  customerPhone?: string | null

  @Column({ name: 'created_by_admin', type: 'tinyint', default: 0 })
  createdByAdmin!: number

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
