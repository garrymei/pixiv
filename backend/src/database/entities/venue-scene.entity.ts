import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Venue } from './venue.entity'
import { VenueBooking } from './venue-booking.entity'

@Entity('venue_scenes')
export class VenueScene {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'venue_id' })
  venueId!: number

  @ManyToOne(() => Venue, venue => venue.scenes)
  @JoinColumn({ name: 'venue_id' })
  venue!: Venue

  @Column({ length: 128 })
  name!: string

  @Column({ name: 'image_url', length: 512, nullable: true })
  imageUrl?: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'int', nullable: true })
  capacity?: number | null

  @Column({ type: 'int', default: 1 })
  status!: number

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @OneToMany(() => VenueBooking, booking => booking.scene)
  bookings!: VenueBooking[]
}
