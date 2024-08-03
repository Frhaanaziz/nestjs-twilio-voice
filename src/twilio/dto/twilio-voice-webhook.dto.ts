import { IsOptional, IsString } from 'class-validator';

export class TwilioVoiceWebhookDto {
  @IsString()
  @IsOptional()
  AccountSid?: string;

  @IsString()
  @IsOptional()
  ApplicationSid?: string;

  @IsString()
  @IsOptional()
  CallSid?: string;

  @IsString()
  @IsOptional()
  CallStatus?: string;

  @IsString()
  @IsOptional()
  Called?: string;

  @IsString()
  Caller: string;

  @IsString()
  @IsOptional()
  Direction?: string;

  @IsString()
  @IsOptional()
  From?: string;

  @IsString()
  To: string;
}
