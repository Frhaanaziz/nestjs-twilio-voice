import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {}

  async getClient({
    accountSid,
    twimlSid,
  }: {
    accountSid: string;
    twimlSid: string;
  }) {
    const { data: user, error: userError } = await this.supabaseService
      .getClient()
      .from('Users')
      .select('id, twilioSetting: Twilio_Settings!inner(*)')
      .eq('twilioSetting.account_sid', accountSid)
      .eq('twilioSetting.twiml_sid', twimlSid)
      .single();
    if (userError) {
      this.logger.error(userError.message, 'getClient');
      throw new BadRequestException(userError.message);
    }

    if (!user.twilioSetting?.account_sid) {
      this.logger.error('Account SID is not set', 'getClient');
      throw new BadRequestException('Account SID is not set');
    }
    if (!user.twilioSetting?.auth_token) {
      this.logger.error('Auth Token is not set', 'getClient');
      throw new BadRequestException('Auth Token is not set');
    }

    return new twilio.Twilio(
      user.twilioSetting.account_sid,
      user.twilioSetting.auth_token,
      { logLevel: 'debug' },
    );
  }

  async getCallerNumber(caller: string) {
    const identity = caller.replace('client:', '').trim();

    const { data: user, error: userError } = await this.supabaseService
      .getClient()
      .from('Users')
      .select('id, twilioAgent: Twilio_Agents!inner(*)')
      .eq('id', identity)
      .single();
    if (userError) {
      this.logger.error(userError.message, 'getCallerNumber');
      throw new BadRequestException(userError.message);
    }

    if (!user.twilioAgent?.twilio_number) {
      this.logger.error('Twilio Number is not set', 'getCallerNumber');
      throw new BadRequestException('Twilio Number is not set');
    }

    return user.twilioAgent.twilio_number;
  }

  async getPhoneNumbers(client: twilio.Twilio) {
    const numbers = await client.incomingPhoneNumbers.list();
    return numbers.map((n) => n.phoneNumber);
  }

  async generateVoiceAccessToken({
    userId,
    ttl = 60 * 60,
  }: {
    userId: string;
    ttl?: number;
  }) {
    const { data: user, error: userError } = await this.supabaseService
      .getClient()
      .from('Users')
      .select('id, twilioSetting: Twilio_Settings(*)')
      .eq('id', userId)
      .single();
    if (userError) {
      this.logger.error(userError.message, 'generateVoiceAccessToken');
      throw new BadRequestException(userError.message);
    }

    const setting = user.twilioSetting;

    if (!setting.account_sid)
      throw new BadRequestException('Account SID is not set');
    if (!setting.api_key) throw new BadRequestException('API Key is not set');
    if (!setting.api_secret)
      throw new BadRequestException('API Secret is not set');
    if (!setting.twiml_sid)
      throw new BadRequestException('Twiml SID is not set');

    const token = new twilio.jwt.AccessToken(
      // const token = new AccessToken(
      setting.account_sid,
      setting.api_key,
      setting.api_secret,
      { identity: userId, ttl },
    );

    const voiceGrant = new twilio.jwt.AccessToken.VoiceGrant({
      // const voiceGrant = new AccessToken.VoiceGrant({
      outgoingApplicationSid: setting.twiml_sid,
      incomingAllow: true,
    });

    token.addGrant(voiceGrant);
    return token.toJwt();
  }

  // getRecordingStatusCallbackUrl(): string {
  //   return (
  //     this.configService.get<string>('BASE_URL') +
  //     '/api/twilio/update-recording-info'
  //   );
  // }

  getUpdateCallStatusCallbackUrl(): string {
    return (
      this.configService.get<string>('BASE_URL') +
      '/webhooks/twilio/update-call-status-info'
    );
  }

  generateTwilioDialResponse(fromNumber: string, toNumber: string): string {
    const response = new twilio.twiml.VoiceResponse();
    const dial = response.dial({
      callerId: fromNumber,
      // record: this.configService.get<boolean>('TWILIO_RECORD_CALLS'),
      // recordingStatusCallback: this.getRecordingStatusCallbackUrl(),
      // recordingStatusCallbackEvent: 'completed',
    });

    dial.number(
      {
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallback: this.getUpdateCallStatusCallbackUrl(),
        statusCallbackMethod: 'POST',
      },
      toNumber,
    );

    return response.toString();
  }

  async getCallInfo({
    client,
    callSid,
  }: {
    client: twilio.Twilio;
    callSid: string;
  }) {
    return client.calls(callSid).fetch();
  }

  generateTwilioClientResponse(client: string): string {
    const response = new twilio.twiml.VoiceResponse();
    const dial = response.dial({
      ringTone: 'at',
      // record: this.configService.get<boolean>('TWILIO_RECORD_CALLS'),
      // recordingStatusCallback: this.getRecordingStatusCallbackUrl(),
      // recordingStatusCallbackEvent: 'completed',
    });

    dial.client(
      {
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallback: this.getUpdateCallStatusCallbackUrl(),
        statusCallbackMethod: 'POST',
      },
      client,
    );

    return response.toString();
  }

  //
  // INCOMING CALL
  //

  // async processIncomingCall({
  //   fromNumber,
  //   toNumber,
  // }: {
  //   fromNumber: string;
  //   toNumber: string;
  // }) {
  //   const owners = await this.getTwilioNumberOwners(toNumber);
  //   const attender = await this.getTheCallAttender(owners, fromNumber);

  //   if (!attender) {
  //     const resp = new VoiceResponse();
  //     resp.say(
  //       'Agent is unavailable to take the call, please call after some time.',
  //     );
  //     return resp.toString();
  //   }

  //   if (attender.call_receiving_device === 'Phone') {
  //     return this.generateTwilioDialResponse(fromNumber, attender.mobile_no);
  //   } else {
  //     // return this.generateTwilioClientResponse(this.safeIdentity(attender.name));
  //     return this.generateTwilioClientResponse(attender.name);
  //   }
  // }

  // private async getTwilioNumberOwners(phoneNumber: string) {
  //   const cleanedPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');

  //   const supabase = this.supabaseService.getClient();
  //   // Query Twilio Agents
  //   const { data: users, error: usersError } = await supabase
  //     .from('Users')
  //     .select(
  //       `
  //       first_name,
  //       last_name,
  //       twilioAgent: Twilio_Agents!inner(twilio_number)
  //       `,
  //     )
  //     .eq('twilioAgent.twilio_number', cleanedPhoneNumber);
  //   if (usersError) throw new BadRequestException(usersError.message);

  //   const userWiseVoiceSettings = Object.fromEntries(
  //     users.map((user) => [
  //       `${user.first_name ?? ''} ${user.last_name ?? ''}`,
  //       user,
  //     ]),
  //   );

  //   // Query Users
  //   const { data: userGeneralSettings, error: userError } = await supabase
  //     .from('users')
  //     .select('name, mobile_no')
  //     .in('name', Object.keys(userWiseVoiceSettings));

  //   if (userError) throw userError;

  //   const userWiseGeneralSettings = Object.fromEntries(
  //     userGeneralSettings.map((user) => [user.name, user]),
  //   );

  //   // Merge the two datasets
  //   return Object.keys(userWiseVoiceSettings).reduce((acc, name) => {
  //     acc[name] = {
  //       ...userWiseGeneralSettings[name],
  //       ...userWiseVoiceSettings[name],
  //     };
  //     return acc;
  //   }, {});
  // }

  // private async getTheCallAttender(
  //   owners: Record<string, Owner>,
  //   caller: string | null,
  // ): Promise<Owner | null> {
  //   if (Object.keys(owners).length === 0) return null;

  //   const currentLoggedInUsers = await this.getActiveLoggedInUsers(
  //     Object.keys(owners),
  //   );

  //   if (currentLoggedInUsers.length > 1 && caller) {
  //     const supabase = this.supabaseService.getClient();

  //     // Check CRM Deal
  //     const { data: dealData, error: dealError } = await supabase
  //       .from('crm_deals')
  //       .select('deal_owner')
  //       .eq('mobile_no', caller)
  //       .single();

  //     if (dealError && dealError.code !== 'PGRST116') throw dealError;

  //     let dealOwner = dealData?.deal_owner;

  //     if (!dealOwner) {
  //       // Check CRM Lead
  //       const { data: leadData, error: leadError } = await supabase
  //         .from('crm_leads')
  //         .select('lead_owner')
  //         .eq('mobile_no', caller)
  //         .eq('converted', false)
  //         .single();

  //       if (leadError && leadError.code !== 'PGRST116') throw leadError;

  //       dealOwner = leadData?.lead_owner;
  //     }

  //     if (dealOwner) {
  //       currentLoggedInUsers = currentLoggedInUsers.filter(
  //         (user) => user === dealOwner,
  //       );
  //     }
  //   }

  //   for (const [name, details] of Object.entries(owners)) {
  //     if (
  //       (details.call_receiving_device === 'Phone' && details.mobile_no) ||
  //       (details.call_receiving_device === 'Computer' &&
  //         currentLoggedInUsers.includes(name))
  //     ) {
  //       return details;
  //     }
  //   }

  //   return null;
  // }
}
