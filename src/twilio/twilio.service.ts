import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import { TwilioVoiceWebhookDto } from './dto/twilio-voice-webhook.dto';
import { TwilioSetting } from './twilio.interface';
import { UpdateTwilioCallStatusDto } from './dto/update-twilio-call-status.dto';
import { Database } from 'src/supabase/supabase.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CallLogsService } from 'src/call-logs/call-logs.service';
import { TwilioIncomingCallDto } from './dto/twilio-incoming-call.dto';
import { UpdateTwilioRecordingInfoDto } from './dto/update-twilio-recording-info.dto';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private readonly supabase: SupabaseClient<Database>;

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
    private readonly callLogsService: CallLogsService,
  ) {
    this.supabase = this.supabaseService.getClient();
  }

  async getClient({ identity }: { identity: string }) {
    const user = await this.getTwilioDataFromIdentity(identity);

    return new twilio.Twilio(
      user.twilioSetting.account_sid,
      user.twilioSetting.auth_token,
      { logLevel: 'debug' },
    );
  }

  async handleVoiceWebhook({
    Caller,
    To,
    CallSid,
    CallStatus,
    From,
  }: TwilioVoiceWebhookDto) {
    const { twilioAgent, twilioSetting } =
      await this.getTwilioDataFromIdentity(Caller);

    if (!twilioAgent?.twilio_number) {
      this.logger.error('getCallerNumber: Twilio Number is not set');
      throw new BadRequestException('Twilio Number is not set');
    }

    const resp = this.generateTwilioDialResponse({
      fromNumber: twilioAgent.twilio_number,
      toNumber: To,
      twilioSetting: twilioSetting,
    });

    await this.callLogsService.create({
      call_sid: CallSid,
      type: this.getDirection({ caller: Caller }),
      caller: Caller,
      status: CallStatus,
      to: To,
      from: From,
    });

    return resp;
  }

  async updateCallStatusInfo(data: UpdateTwilioCallStatusDto) {
    try {
      const twilioClient = await this.getClient({
        identity: data.Caller.startsWith('client:') ? data.Caller : data.To,
      });

      if (data.CallStatus !== 'completed') {
        await twilioClient
          .calls(data.ParentCallSid)
          .userDefinedMessages.create({
            content: JSON.stringify(data),
          });
      }

      const callDetails = await this.getCallInfo({
        callSid: data.ParentCallSid,
        client: twilioClient,
      });
      await this.callLogsService.update({
        match: { call_sid: data.ParentCallSid },
        data: {
          status: data.CallStatus,
          duration: data.CallDuration,
          to: data.To,
          from: data.From,
          price: callDetails.price,
          price_unit: callDetails.priceUnit,
          start_time: callDetails.startTime?.toISOString(),
          end_time: callDetails.startTime?.toISOString(),
        },
      });
    } catch (error) {
      this.logger.error(`updateCallStatusInfo: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  async updateRecordingInfo(data: UpdateTwilioRecordingInfoDto) {
    try {
      await this.callLogsService.update({
        match: { call_sid: data.CallSid },
        data: { recording_url: data.RecordingUrl },
      });
    } catch (error) {
      this.logger.error(`updateRecordingInfo: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  async generateVoiceAccessToken({
    user_id,
    ttl = 60 * 60,
  }: {
    user_id: string;
    ttl?: number;
  }) {
    const { twilioSetting } = await this.getTwilioDataFromIdentity(
      `client:${user_id}`,
    );

    if (!twilioSetting.account_sid) {
      this.logger.error('generateVoiceAccessToken: Account SID is not set');
      throw new BadRequestException('Account SID is not set');
    }
    if (!twilioSetting.api_key) {
      this.logger.error('generateVoiceAccessToken: API Key is not set');
      throw new BadRequestException('API Key is not set');
    }
    if (!twilioSetting.api_secret) {
      this.logger.error('generateVoiceAccessToken: API Secret is not set');
      throw new BadRequestException('API Secret is not set');
    }
    if (!twilioSetting.twiml_sid) {
      this.logger.error('generateVoiceAccessToken: Twiml SID is not set');
      throw new BadRequestException('Twiml SID is not set');
    }

    const token = new twilio.jwt.AccessToken(
      twilioSetting.account_sid,
      twilioSetting.api_key,
      twilioSetting.api_secret,
      { identity: user_id, ttl },
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
    if (identity.startsWith('client:')) {
      const { data: user, error: userError } = await this.supabase
        .from('Users')
        .select(
          'id, twilioSetting: Twilio_Settings(*), twilioAgent: Twilio_Agents(*)',
        )
        .eq('id', identity.replace('client:', ''))
        .single();
      if (userError) {
        this.logger.error(`getTwilioDataFromIdentity: ${userError.message}`);
        throw new BadRequestException(userError.message);
      }

      return user;
    } else {
      const { data: user, error: userError } = await this.supabase
        .from('Users')
        .select(
          'id, twilioSetting: Twilio_Settings(*), twilioAgent: Twilio_Agents!inner(*)',
        )
        .eq('twilioAgent.twilio_number', identity)
        .single();
      if (userError) {
        this.logger.error(`getTwilioDataFromIdentity: ${userError.message}`);
        throw new BadRequestException(userError.message);
      }

      return user;
    }
  }

  //
  // INCOMING CALL
  //

  async processIncomingCall({
    From,
    To,
    CallSid,
    CallStatus,
    Called,
    Caller,
  }: TwilioIncomingCallDto) {
    const user = await this.getTwilioNumberOwners(To);

    let resp: string;
    if (user.twilioAgent.call_receiving_device === 'Phone') {
      if (!user.phone) {
        const response = new twilio.twiml.VoiceResponse();
        response.say(
          'Agent is unavailable to take the call, please call after some time.',
        );
        resp = response.toString();
      } else {
        resp = this.generateTwilioDialResponse({
          fromNumber: From,
          toNumber: user.phone,
          twilioSetting: user.twilioSetting,
        });
      }
    } else {
      resp = this.generateTwilioClientResponse({
        identity: user.id,
        twilioSetting: user.twilioSetting,
      });
    }

    await this.callLogsService.create({
      call_sid: CallSid,
      type: this.getDirection({ caller: Caller }),
      caller: Caller,
      receiver: Called,
      status: CallStatus,
      to: To,
      from: From,
    });

    return resp;
  }

  private async getTwilioNumberOwners(phoneNumber: string) {
    const cleanedPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');

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
    if (usersError) {
      this.logger.error(`getTwilioNumberOwners: ${usersError.message}`);
      throw new BadRequestException(usersError.message);
    }

    return users;
  }

  //
  // UTILS
  //

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
      this.logger.error('validateTwilioRequest: Invalid Twilio Request');
      throw new BadRequestException('Invalid Twilio Request');
    }
  }

  getRecordingStatusCallbackUrl() {
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
