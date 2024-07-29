import { IsString } from 'class-validator';

export class VoiceWebhookDto {
  @IsString()
  AccountSid: string;

  @IsString()
  ApplicationSid: string;

  @IsString()
  CallSid: string;

  @IsString()
  CallStatus: string;

  @IsString()
  Caller: string;

  @IsString()
  Direction: string;

  @IsString()
  From: string;

  @IsString()
  To: string;
}
