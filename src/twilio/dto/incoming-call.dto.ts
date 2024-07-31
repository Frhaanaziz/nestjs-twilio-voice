import { IsOptional, IsString } from 'class-validator';

export class IncomingCallDto {
  @IsString()
  @IsOptional()
  AccountSid: string;

  @IsString()
  @IsOptional()
  From: string;

  @IsString()
  @IsOptional()
  To: string;
}
