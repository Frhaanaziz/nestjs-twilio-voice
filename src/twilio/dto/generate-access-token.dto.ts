import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateAccessTokenDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;
}
