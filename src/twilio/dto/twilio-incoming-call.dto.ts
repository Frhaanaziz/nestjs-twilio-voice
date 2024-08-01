import { IsOptional, IsString } from 'class-validator';

export class TwilioIncomingCallDto {
  @IsOptional()
  @IsString()
  CallSid?: string;

  @IsOptional()
  @IsString()
  AccountSid?: string;

  @IsOptional()
  @IsString()
  From?: string;

  @IsOptional()
  @IsString()
  To?: string;

  @IsOptional()
  @IsString()
  CallStatus?: string;

  @IsOptional()
  @IsString()
  Called?: string;

  @IsOptional()
  @IsString()
  Caller?: string;
}
