import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import { VoiceWebhookDto } from './dto/voice-webhook.dto';
import { TwilioAgent, TwilioSetting } from './twilio.interface';
import { UpdateCallStatusDto } from './dto/update-call-status.dto';
import { Database } from 'src/supabase/supabase.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private readonly supabase: SupabaseClient<Database>;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    this.supabase = this.supabaseService.getClient();
  }

  async getClient({ twilioNumber }: { twilioNumber: string }) {
    const { data: user, error: userError } = await this.supabase
      .from('Users')
      .select(
        'id, twilioSetting: Twilio_Settings(*), twilioAgent: Twilio_Agents!inner(*)',
      )
      .eq('twilioAgent.twilio_number', twilioNumber)
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

  async handleVoiceWebhook({ Caller, To, CallSid }: VoiceWebhookDto) {
    const { twilioAgent, twilioSetting } =
      await this.getTwilioDataFromIdentity(Caller);

    const fromNumber = this.getCallerNumber({ twilioAgent });
    const resp = await this.generateTwilioDialResponse({
      fromNumber,
      toNumber: To,
      twilioSetting: twilioSetting,
    });

    await this.createCallLog({ caller: Caller, callSid: CallSid });

    return resp;
  }

  async generateVoiceAccessToken({
    userId,
    ttl = 60 * 60,
  }: {
    userId: string;
    ttl?: number;
  }) {
    const { twilioSetting } = await this.getTwilioDataFromIdentity(userId);

    if (!twilioSetting.account_sid)
      throw new BadRequestException('Account SID is not set');
    if (!twilioSetting.api_key)
      throw new BadRequestException('API Key is not set');
    if (!twilioSetting.api_secret)
      throw new BadRequestException('API Secret is not set');
    if (!twilioSetting.twiml_sid)
      throw new BadRequestException('Twiml SID is not set');

    const token = new twilio.jwt.AccessToken(
      twilioSetting.account_sid,
      twilioSetting.api_key,
      twilioSetting.api_secret,
      { identity: userId, ttl },
    );

    const voiceGrant = new twilio.jwt.AccessToken.VoiceGrant({
      outgoingApplicationSid: twilioSetting.twiml_sid,
      incomingAllow: true,
    });

    token.addGrant(voiceGrant);
    return token.toJwt();
  }

  generateTwilioDialResponse({
    fromNumber,
    toNumber,
    twilioSetting,
  }: {
    fromNumber: string;
    toNumber: string;
    twilioSetting: TwilioSetting;
  }) {
    const response = new twilio.twiml.VoiceResponse();
    const dial = response.dial({
      callerId: fromNumber,
      record: twilioSetting.record_calls
        ? 'record-from-answer-dual'
        : 'do-not-record',
      recordingStatusCallback: this.getRecordingStatusCallbackUrl(),
      recordingStatusCallbackEvent: ['completed'],
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

  generateTwilioClientResponse({
    identity,
    twilioSetting,
  }: {
    identity: string;
    twilioSetting: TwilioSetting;
  }): string {
    const response = new twilio.twiml.VoiceResponse();
    const dial = response.dial({
      ringTone: 'at',
      record: twilioSetting.record_calls
        ? 'record-from-answer-dual'
        : 'do-not-record',
      recordingStatusCallback: this.getRecordingStatusCallbackUrl(),
      recordingStatusCallbackEvent: ['completed'],
    });

    dial.client(
      {
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallback: this.getUpdateCallStatusCallbackUrl(),
        statusCallbackMethod: 'POST',
      },
      identity,
    );

    return response.toString();
  }

  async getTwilioDataFromIdentity(identity: string) {
    const safeIdentity = identity.replace('client:', '').trim();

    const { data: user, error: userError } = await this.supabase
      .from('Users')
      .select(
        'id, twilioSetting: Twilio_Settings(*), twilioAgent: Twilio_Agents(*)',
      )
      .eq('id', safeIdentity)
      .single();
    if (userError) {
      this.logger.error(userError.message, 'getTwilioDataFromIdentity');
      throw new BadRequestException(userError.message);
    }

    return user;
  }

  async updateCallStatusInfo(data: UpdateCallStatusDto) {
    try {
      await this.updateCallLog({
        caller: data.Caller,
        callSid: data.ParentCallSid,
        status: data.CallStatus,
      });

      // const callInfo = {
      //   ParentCallSid: data.ParentCallSid,
      //   CallSid: data.CallSid,
      //   CallStatus: data.CallStatus,
      //   CallDuration: data.CallDuration,
      //   From: data.From,
      //   To: data.To,
      // };

      const twilioClient = await this.getClient({ twilioNumber: data.Caller });
      await twilioClient.calls(data.ParentCallSid).userDefinedMessages.create({
        // content: JSON.stringify(callInfo),
        content: JSON.stringify(data),
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to update Twilio call status: ' + error.message,
      );
    }
  }

  async createCallLog({
    caller,
    callSid,
  }: {
    caller: string;
    callSid: string;
  }) {
    const twilio = await this.getClient({ twilioNumber: caller });
    const callDetails = await this.getCallInfo({ callSid, client: twilio });

    const { error: insertError } = await this.supabase
      .from('Call_Logs')
      .insert({
        call_sid: callSid,
        type: this.getDirection({ caller }),
        caller,
        status: callDetails.status,
        duration: callDetails.duration,
        to: callDetails.to,
        from: callDetails.from,
        price: callDetails.price,
        price_unit: callDetails.priceUnit,
        start_time: callDetails.startTime?.toISOString(),
        end_time: callDetails.startTime?.toISOString(),
      });
    if (insertError) {
      console.error('Failed to create call log:', insertError);
    }
  }

  async updateCallLog({
    caller,
    callSid,
    status,
  }: {
    caller: string;
    callSid: string;
    status?: string;
  }) {
    const twilio = await this.getClient({ twilioNumber: caller });

    // const { data, error } = await supabase
    //   .from('Call_Logs')
    //   .select()
    //   .eq('call_sid', callSid)
    //   .single();
    // if (error || !data) return;

    const callDetails = await this.getCallInfo({ callSid, client: twilio });

    const updatedStatus = status || callDetails.status;

    const { error: updateError } = await this.supabase
      .from('Call_Logs')
      .update({
        // status: this.getCallStatus(updatedStatus),
        status: updatedStatus,
        duration: callDetails.duration,
        to: callDetails.to,
        from: callDetails.from,
        price: callDetails.price,
        price_unit: callDetails.priceUnit,
        start_time: callDetails.startTime?.toISOString(),
        end_time: callDetails.startTime?.toISOString(),
      })
      .eq('call_sid', callSid);
    if (updateError) {
      console.error('Failed to update call log:', updateError);
    }
  }

  //
  // INCOMING CALL
  //

  async processIncomingCall({
    fromNumber,
    toNumber,
  }: {
    fromNumber: string;
    toNumber: string;
  }) {
    const user = await this.getTwilioNumberOwners(toNumber);

    // if (!attender) {
    //   const resp = new VoiceResponse();
    //   resp.say(
    //     'Agent is unavailable to take the call, please call after some time.',
    //   );
    //   return resp.toString();
    // }

    if (user.twilioAgent.call_receiving_device === 'Phone' && !!user.phone) {
      return this.generateTwilioDialResponse({
        fromNumber,
        toNumber: user.phone,
        twilioSetting: user.twilioSetting,
      });
    } else {
      return this.generateTwilioClientResponse({
        identity: user.id,
        twilioSetting: user.twilioSetting,
      });
    }
  }

  private async getTwilioNumberOwners(phoneNumber: string) {
    const cleanedPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');

    // Query Twilio Agents
    const { data: users, error: usersError } = await this.supabase
      .from('Users')
      .select(
        `
        *,
        twilioAgent: Twilio_Agents!inner(*),
        twilioSetting: Twilio_Settings(*)
        `,
      )
      .eq('twilioAgent.twilio_number', cleanedPhoneNumber)
      .single();
    if (usersError) throw new BadRequestException(usersError.message);

    return users;
  }

  //
  // UTILS
  //

  // getCallStatus(twilioStatus?: string | null) {
  //   if (!twilioStatus) return '';

  //   return twilioStatus
  //     .split('-')
  //     .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  //     .join(' ');
  // }

  getDirection({ caller }: { caller: string }) {
    if (caller.toLowerCase().startsWith('client:')) {
      return 'Outgoing';
    } else {
      return 'Incoming';
    }
  }

  async validateTwilioRequest({
    signature,
    url,
    body,
    identity,
  }: {
    signature: string;
    url: string;
    body: any;
    identity: string;
  }) {
    const { twilioSetting } = await this.getTwilioDataFromIdentity(identity);

    const isValid = twilio.validateRequest(
      twilioSetting.auth_token,
      signature,
      url,
      body,
    );
    if (!isValid) {
      this.logger.error('Invalid Twilio Request', 'validateTwilioRequest');
      throw new BadRequestException('Invalid Twilio Request');
    }
  }

  getCallerNumber({ twilioAgent }: { twilioAgent: TwilioAgent }) {
    if (!twilioAgent?.twilio_number) {
      this.logger.error('Twilio Number is not set', 'getCallerNumber');
      throw new BadRequestException('Twilio Number is not set');
    }

    return twilioAgent.twilio_number;
  }

  async getPhoneNumbers(client: twilio.Twilio) {
    const numbers = await client.incomingPhoneNumbers.list();
    return numbers.map((n) => n.phoneNumber);
  }

  getRecordingStatusCallbackUrl(): string {
    return (
      this.configService.get<string>('BASE_URL') +
      '/webhooks/twilio/update-recording-info'
    );
  }

  getUpdateCallStatusCallbackUrl(): string {
    return (
      this.configService.get<string>('BASE_URL') +
      '/webhooks/twilio/update-call-status-info'
    );
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
}
