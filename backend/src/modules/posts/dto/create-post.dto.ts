import { ArrayMinSize, IsArray, IsIn, IsOptional, IsString, Length } from 'class-validator'

export class CreatePostDto {
  @IsString()
  @Length(1, 255)
  title!: string

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  content?: string

  @IsIn(['work', 'daily'])
  post_type!: 'work' | 'daily'

  @IsOptional()
  @IsString()
  cover_image?: string

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  images?: string[]

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]
}
