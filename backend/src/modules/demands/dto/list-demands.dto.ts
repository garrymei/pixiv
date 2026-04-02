import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator'
import { DemandType } from '../../../types/enums'

export class ListDemandsDto {
  @IsOptional()
  @IsEnum(DemandType)
  demand_type?: DemandType

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
