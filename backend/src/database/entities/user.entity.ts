import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Post } from './post.entity'
import { Comment } from './comment.entity'
import { Like } from './like.entity'
import { EventRegistration } from './event-registration.entity'
import { Demand } from './demand.entity'
import { DemandApplication } from './demand-application.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 64 })
  nickname!: string

  @Column({ name: 'avatar_url', length: 255, nullable: true })
  avatarUrl?: string

  @Column({ length: 255, nullable: true })
  bio?: string

  @Column({ length: 64, nullable: true })
  city?: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @OneToMany(() => Post, p => p.author)
  posts!: Post[]

  @OneToMany(() => Comment, c => c.author)
  comments!: Comment[]

  @OneToMany(() => Like, l => l.user)
  likes!: Like[]

  @OneToMany(() => EventRegistration, r => r.user)
  eventRegistrations!: EventRegistration[]

  @OneToMany(() => Demand, d => d.author)
  demands!: Demand[]

  @OneToMany(() => DemandApplication, a => a.user)
  demandApplications!: DemandApplication[]
}
