import { IsString, IsOptional } from 'class-validator';

// example of twilio webhook payload when call is completed
// {
//   Called: '+6282120000339',
//   ParentCallSid: 'CAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
//   ToState: 'Jakarta',
//   CallerCountry: 'US',
//   Direction: 'outbound-dial',
//   Timestamp: 'Wed, 31 Jul 2024 02:54:50 +0000',
//   CallbackSource: 'call-progress-events',
//   SipResponseCode: '200', // only exist when call is completed
//   CallerState: 'AL',
//   ToZip: '',
//   SequenceNumber: '3',
//   CallSid: 'CAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
//   To: '+6282120000339',
//   CallerZip: '35203',
//   ToCountry: 'ID',
//   CalledZip: '',
//   ApiVersion: '2010-04-01',
//   CalledCity: '',
//   CallStatus: 'completed',
//   Duration: '1', // only exist when call is completed
//   From: '+12055264586',
//   CallDuration: '47', // only exist when call is completed
//   AccountSid: 'ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
//   CalledCountry: 'ID',
//   CallerCity: 'BIRMINGHAM',
//   ToCity: '',
//   FromCountry: 'US',
//   Caller: '+12055264586',
//   FromCity: 'BIRMINGHAM',
//   CalledState: 'Jakarta',
//   FromZip: '35203',
//   FromState: 'AL',
// };

export class UpdateTwilioCallStatusDto {
  @IsOptional()
  @IsString()
  Called: string;

  @IsString()
  ParentCallSid: string;

  @IsOptional()
  @IsString()
  ToState: string;

  @IsOptional()
  @IsString()
  CallerCountry: string;

  @IsOptional()
  @IsString()
  Direction: string;

  @IsOptional()
  @IsString()
  Timestamp: string;

  @IsOptional()
  @IsString()
  CallbackSource: string;

  @IsOptional()
  @IsString()
  CallerState: string;

  @IsOptional()
  @IsString()
  ToZip: string;

  @IsOptional()
  @IsString()
  SequenceNumber: string;

  @IsString()
  CallSid: string;

  @IsString()
  To: string;

  @IsOptional()
  @IsString()
  CallerZip: string;

  @IsOptional()
  @IsString()
  ToCountry: string;

  @IsOptional()
  @IsString()
  CalledZip: string;

  @IsOptional()
  @IsString()
  ApiVersion: string;

  @IsOptional()
  @IsString()
  CalledCity: string;

  @IsString()
  CallStatus: string;

  @IsString()
  From: string;

  @IsOptional()
  @IsString()
  AccountSid: string;

  @IsOptional()
  @IsString()
  CalledCountry: string;

  @IsOptional()
  @IsString()
  CallerCity: string;

  @IsOptional()
  @IsString()
  ToCity: string;

  @IsOptional()
  @IsString()
  FromCountry: string;

  @IsOptional()
  @IsString()
  Caller: string;

  @IsOptional()
  @IsString()
  FromCity: string;

  @IsOptional()
  @IsString()
  CalledState: string;

  @IsOptional()
  @IsString()
  FromZip: string;

  @IsOptional()
  @IsString()
  FromState: string;

  @IsOptional()
  @IsString()
  SipResponseCode: string;

  @IsOptional()
  @IsString()
  Duration: string;

  @IsOptional()
  @IsString()
  CallDuration: string;
}
