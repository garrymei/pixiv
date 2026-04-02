import { IsInt, IsOptional, IsString, Min, Length } from 'class-validator'

export class CreateCommentDto {
  @IsInt()
  @Min(1)
  post_id!: number

  @IsString()
  @Length(1, 2000)
  content!: string

  @IsOptional()
  @IsInt()
  @Min(1)
  parent_id?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  reply_user_id?: number
}
