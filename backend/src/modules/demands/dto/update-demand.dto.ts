import { IsEnum, IsIn, IsInt, IsOptional, IsString, Length, Min } from 'class-validator'
import { DemandType } from '../../../types/enums'

export class UpdateDemandDto {
  @IsOptional()
  @IsEnum(DemandType)
  demand_type?: DemandType

  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string

  @IsOptional()
  @IsString()
  @Length(0, 64)
  city?: string

  @IsOptional()
  @IsString()
  @Length(1, 255)
  location?: string

  @IsOptional()
  @IsInt()
  event_time?: number

  @IsOptional()
  @IsIn(['free', 'exchange', 'negotiable', 'fixed'])
  budget_type?: string

  @IsOptional()
  @IsInt()
  budget_amount?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  participant_limit?: number

  @IsOptional()
  @IsInt()
  deadline?: number
}
