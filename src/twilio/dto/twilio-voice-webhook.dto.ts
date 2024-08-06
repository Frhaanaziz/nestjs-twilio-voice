import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class TwilioVoiceWebhookDto {
  @IsOptional()
  @IsString()
  AccountSid?: string;

  @IsOptional()
  @IsString()
  ApplicationSid?: string;

  @IsOptional()
  @IsString()
  CallSid?: string;

  @IsOptional()
  @IsString()
  CallStatus?: string;

  @IsOptional()
  @IsString()
  Called?: string;

  @IsString()
  Caller: string;

  @IsOptional()
  @IsString()
  Direction?: string;

  @IsOptional()
  @IsString()
  From?: string;

  @IsString()
  To: string;

  @IsString()
  contact_id: string;

  @IsString()
  user_id: string;

  @IsString()
  organization_id: string;

  @IsOptional()
  @IsString()
  lead_id?: string;

  @IsOptional()
  @IsString()
  opportunity_id?: string;
}
