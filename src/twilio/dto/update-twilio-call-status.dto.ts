import { IsString, IsOptional } from 'class-validator';

export class UpdateTwilioCallStatusDto {
  @IsOptional()
  @IsString()
  Called?: string;

  @IsString()
  ParentCallSid: string;

  @IsOptional()
  @IsString()
  ToState?: string;

  @IsOptional()
  @IsString()
  CallerCountry?: string;

  @IsOptional()
  @IsString()
  Direction?: string;

  @IsOptional()
  @IsString()
  Timestamp?: string;

  @IsOptional()
  @IsString()
  CallbackSource?: string;

  @IsOptional()
  @IsString()
  CallerState?: string;

  @IsOptional()
  @IsString()
  ToZip?: string;

  @IsOptional()
  @IsString()
  SequenceNumber?: string;

  @IsString()
  CallSid: string;

  @IsString()
  To: string;

  @IsOptional()
  @IsString()
  CallerZip?: string;

  @IsOptional()
  @IsString()
  ToCountry?: string;

  @IsOptional()
  @IsString()
  CalledZip?: string;

  @IsOptional()
  @IsString()
  ApiVersion?: string;

  @IsOptional()
  @IsString()
  CalledCity?: string;

  @IsString()
  CallStatus: string;

  @IsString()
  From: string;

  @IsOptional()
  @IsString()
  AccountSid?: string;

  @IsOptional()
  @IsString()
  CalledCountry?: string;

  @IsOptional()
  @IsString()
  CallerCity?: string;

  @IsOptional()
  @IsString()
  ToCity?: string;

  @IsOptional()
  @IsString()
  FromCountry?: string;

  @IsOptional()
  @IsString()
  Caller?: string;

  @IsOptional()
  @IsString()
  FromCity?: string;

  @IsOptional()
  @IsString()
  CalledState?: string;

  @IsOptional()
  @IsString()
  FromZip?: string;

  @IsOptional()
  @IsString()
  FromState?: string;

  @IsOptional()
  @IsString()
  SipResponseCode?: string;

  @IsOptional()
  @IsString()
  Duration?: string;

  @IsOptional()
  @IsString()
  CallDuration?: string;

  @IsOptional()
  @IsString()
  RecordingUrl?: string;
}
