import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, Min } from 'class-validator'

export class ListPostsDto {
  @IsOptional()
  @IsIn(['work', 'daily'])
  type?: 'work' | 'daily'

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
