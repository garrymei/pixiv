import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, Min } from 'class-validator'

export class ListEventsDto {
  @IsOptional()
  @IsIn(['info', 'official'])
  type?: 'info' | 'official'

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number
}
