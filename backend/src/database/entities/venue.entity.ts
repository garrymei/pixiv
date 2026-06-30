import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { VenueScene } from './venue-scene.entity'
import { VenueBooking } from './venue-booking.entity'

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 128 })
  name!: string

  @Column({ length: 128, nullable: true })
  city?: string

  @Column({ length: 255, nullable: true })
  address?: string

  @Column({ name: 'cover_image', length: 512, nullable: true })
  coverImage?: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'int', default: 1 })
  status!: number

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @OneToMany(() => VenueScene, scene => scene.venue)
  scenes!: VenueScene[]

  @OneToMany(() => VenueBooking, booking => booking.venue)
  bookings!: VenueBooking[]
}
