import { IsOptional, IsString, Length } from 'class-validator'

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 64)
  nickname?: string

  @IsOptional()
  @IsString()
  @Length(0, 255)
  avatar?: string

  @IsOptional()
  @IsString()
  @Length(0, 255)
  bio?: string

  @IsOptional()
  @IsString()
  @Length(0, 64)
  city?: string

  @IsOptional()
  @IsString()
  @Length(0, 32)
  role_type?: string
}
