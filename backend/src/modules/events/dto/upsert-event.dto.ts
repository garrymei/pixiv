import { Type } from 'class-transformer'
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator'

export class UpsertEventDto {
  @IsString()
  @MaxLength(120)
  title!: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  cover_image?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  start_time?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  end_time?: number

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price?: number | null

  @IsOptional()
  @IsString()
  @MaxLength(120)
  organizer?: string

  @IsOptional()
  @IsIn(['UPCOMING', 'ONGOING', 'ENDED'])
  status?: 'UPCOMING' | 'ONGOING' | 'ENDED'

  @IsOptional()
  @IsIn(['info', 'official'])
  event_type?: 'info' | 'official'

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_registerable?: boolean

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  capacity?: number | null

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  registration_deadline?: number | null
}
