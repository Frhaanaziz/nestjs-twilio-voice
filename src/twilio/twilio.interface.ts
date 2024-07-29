import Twilio from 'twilio/lib/rest/Twilio';
import type { ClientOpts } from 'twilio/lib/base/BaseTwilio';
import { Tables } from 'src/supabase/supabase.types';

export type TwilioClient = Twilio;

export interface TwilioModuleOptions {
  accountSid: string | undefined;
  authToken: string | undefined;
  options?: ClientOpts | undefined;
}

export type TwilioSetting = Tables<'Twilio_Settings'>;
export type TwilioAgent = Tables<'Twilio_Agents'>;
