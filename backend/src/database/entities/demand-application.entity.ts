import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { Demand } from './demand.entity'
import { User } from './user.entity'
import { ApplicationStatus } from '../../types/enums'

@Entity('demand_applications')
@Unique(['demandId', 'userId'])
export class DemandApplication {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'demand_id' })
  demandId!: number

  @ManyToOne(() => Demand, d => d.applications)
  demand!: Demand

  @Column({ name: 'user_id' })
  userId!: number

  @ManyToOne(() => User, u => u.demandApplications)
  user!: User

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.APPLIED })
  status!: ApplicationStatus

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark?: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
