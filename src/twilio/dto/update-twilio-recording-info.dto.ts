// example of twilio webhook payload when recording is completed
// {
//     RecordingSource: 'DialVerb',
//     RecordingTrack: 'both',
//     RecordingSid: 'REaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
//     RecordingUrl:
//       'https://api.twilio.com/2010-04-01/Accounts/ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/Recordings/REaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
//     RecordingStatus: 'completed',
//     RecordingChannels: '2',
//     ErrorCode: '0',
//     CallSid: 'CAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
//     RecordingStartTime: 'Thu, 01 Aug 2024 04:20:56 +0000',
//     AccountSid: 'ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
//     RecordingDuration: '53',
//   };

import { IsOptional, IsString } from 'class-validator';

export class UpdateTwilioRecordingInfoDto {
  @IsOptional()
  @IsString()
  RecordingSource?: string;

  @IsOptional()
  @IsString()
  RecordingTrack?: string;

  @IsOptional()
  @IsString()
  RecordingSid?: string;

  @IsOptional()
  @IsString()
  RecordingUrl?: string;

  @IsOptional()
  @IsString()
  RecordingStatus?: string;

  @IsOptional()
  @IsString()
  RecordingChannels?: string;

  @IsOptional()
  @IsString()
  ErrorCode?: string;

  @IsString()
  CallSid: string;

  @IsOptional()
  @IsString()
  RecordingStartTime?: string;

  @IsOptional()
  @IsString()
  AccountSid?: string;

  @IsOptional()
  @IsString()
  RecordingDuration?: string;
}
