import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateTwilioAccessTokenDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;
}
