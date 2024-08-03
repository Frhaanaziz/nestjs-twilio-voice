import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import { TwilioVoiceWebhookDto } from './dto/twilio-voice-webhook.dto';
import { TwilioSetting } from './twilio.interface';
import { UpdateTwilioCallStatusDto } from './dto/update-twilio-call-status.dto';
import { Database } from 'src/supabase/supabase.types';
import { CallLogsService } from 'src/call-logs/call-logs.service';
import { TwilioIncomingCallDto } from './dto/twilio-incoming-call.dto';
import { UsersService } from 'src/users/users.service';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly callLogsService: CallLogsService,
    private readonly usersService: UsersService,
  ) {}

  async getClient({ Caller, To }: { Caller: string; To: string }) {
    const { twilioSetting } = await this.getTwilioData({ Caller, To });

    return new twilio.Twilio(
      twilioSetting.account_sid,
      twilioSetting.auth_token,
      { logLevel: 'debug' },
    );
  }

  /**
   * Generates a Twilio voice access token for a given user.
   * @param {Object} options - The options for generating the access token.
   * @param {string} options.user_id - The user ID for which the access token is generated.
   * @param {number} [options.ttl=3600] - The time to live (in seconds) for the access token.
   * @returns {string} The generated Twilio voice access token.
   * @throws {BadRequestException} If any required Twilio settings are missing.
   */
  async generateVoiceAccessToken({
    user_id,
    ttl = 60 * 60,
  }: {
    user_id: string;
    ttl?: number;
  }) {
    const { twilioSetting } =
      await this.usersService.getTwilioDataFromUserId(user_id);

    if (!twilioSetting) {
      this.logger.error('generateVoiceAccessToken: Twilio Setting not found');
      throw new BadRequestException('Twilio Setting not found');
    }
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

  /**
   * Handles the Twilio voice webhook.
   *
   * @param {TwilioVoiceWebhookDto} options - The Twilio voice webhook data.
   * @returns {Promise<VoiceResponse>} - The response generated for the webhook.
   * @throws {BadRequestException} - If the Twilio Agent is not found, Twilio Number is not set, or Twilio Setting is not found.
   */
  async handleVoiceWebhook({
    Caller,
    To,
    CallSid,
    CallStatus,
    From,
    Called,
  }: TwilioVoiceWebhookDto) {
    const { twilioAgent, twilioSetting } = await this.getTwilioData({
      Caller,
      To,
    });

    if (!twilioAgent) {
      this.logger.error('handleVoiceWebhook: Twilio Agent not found');
      throw new BadRequestException('Twilio Agent not found');
    }
    if (!twilioAgent.twilio_number) {
      this.logger.error('handleVoiceWebhook: Twilio Number is not set');
      throw new BadRequestException('Twilio Number is not set');
    }
    if (!twilioSetting) {
      this.logger.error('handleVoiceWebhook: Twilio Setting not found');
      throw new BadRequestException('Twilio Setting not found');
    }

    const resp = this.generateDialResponse({
      fromNumber: twilioAgent.twilio_number,
      toNumber: To,
      twilioSetting,
    });

    await this.callLogsService.create({
      call_sid: CallSid,
      type: this.getDirection({ caller: Caller }),
      status: CallStatus,
      caller: Caller,
      receiver: Called,
      to: To,
      from: From,
    });

    return resp;
  }

  /**
   * Processes an incoming call and determines the appropriate response based on the user's settings.
   *
   * @param {TwilioIncomingCallDto} incomingCall - The incoming call details.
   * @returns {Promise<VoiceResponse>} - The TwiML response to be sent back to Twilio.
   */
  async processIncomingCallWebhook({
    From,
    To,
    CallSid,
    CallStatus,
    Called,
    Caller,
  }: TwilioIncomingCallDto) {
    // Get the user data based on the To number (Twilio number)
    const user = await this.usersService.getTwilioDataFromTwilioNumber(To);

    let resp: VoiceResponse;

    // If the user is set to receive calls on their phone, dial the user's phone number
    if (user.twilioAgent.call_receiving_device === 'Phone') {
      // If the user's phone number is not set, inform the caller that the agent is unavailable
      if (!user.phone) {
        const response = new twilio.twiml.VoiceResponse();
        response.say(
          'Agent is unavailable to take the call, please call after some time.',
        );
        resp = response.toString();
      } else {
        resp = this.generateDialResponse({
          fromNumber: From,
          toNumber: user.phone,
          twilioSetting: user.twilioSetting,
        });
      }
    } else {
      resp = this.generateClientResponse({
        identity: user.id,
        twilioSetting: user.twilioSetting,
      });
    }

    // Create a new call log entry for the incoming call
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

  /**
   * Updates the call status information based on the provided data.
   * If the call is not completed, a user-defined message is sent to the parent call to update the call status in the client application.
   * The call details are fetched using the parent call SID and the call status information is updated in the call logs service.
   *
   * @param data - The data containing the call status information.
   * @throws BadRequestException if there is an error updating the call status information.
   */
  async updateCallStatusInfo(data: UpdateTwilioCallStatusDto) {
    try {
      const twilioClient = await this.getClient({
        Caller: data.Caller,
        To: data.To,
      });

      // If the call is not completed, send a user-defined message to the parent call. This is used to update the call status in the client application.
      // Note: The user-defined message is only sent for ongoing calls.
      if (data.CallStatus !== 'completed') {
        await twilioClient
          .calls(data.ParentCallSid)
          .userDefinedMessages.create({
            content: JSON.stringify(data),
          });
      }

      // Get the call details using the parent call SID and update the call status information.
      const callDetails = await twilioClient.calls(data.ParentCallSid).fetch();

      await this.callLogsService.update({
        match: { call_sid: data.ParentCallSid },
        data: {
          status: data.CallStatus,
          duration: data.CallDuration,
          to: data.To,
          from: data.From,
          caller: data.Caller,
          receiver: data.Called,
          price: callDetails.price,
          price_unit: callDetails.priceUnit,
          recording_url: data.RecordingUrl, // Recording URL is only available for completed calls
          start_time: callDetails.startTime?.toISOString(),
          end_time: callDetails.startTime?.toISOString(),
        },
      });
    } catch (error) {
      this.logger.error(`updateCallStatusInfo: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Generates a Twilio VoiceResponse object for dialing a phone number.
   *
   * @param fromNumber - The phone number to use as the caller ID.
   * @param toNumber - The phone number to dial.
   * @param twilioSetting - The Twilio settings for the call.
   * @returns A Twilio VoiceResponse object.
   */
  generateDialResponse({
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
    });

    dial.number(
      {
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallback: this.getUpdateCallStatusCallbackUrl(),
        statusCallbackMethod: 'POST',
      },
      toNumber,
    );

    return response;
  }

  /**
   * Generates a Twilio client response for a given identity and Twilio setting.
   *
   * @param identity - The identity of the client.
   * @param twilioSetting - The Twilio setting object.
   * @returns The Twilio VoiceResponse object.
   */
  generateClientResponse({
    identity,
    twilioSetting,
  }: {
    identity: string;
    twilioSetting: TwilioSetting;
  }) {
    const response = new twilio.twiml.VoiceResponse();
    const dial = response.dial({
      ringTone: 'at',
      record: twilioSetting.record_calls
        ? 'record-from-answer-dual'
        : 'do-not-record',
    });

    dial.client(
      {
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallback: this.getUpdateCallStatusCallbackUrl(),
        statusCallbackMethod: 'POST',
      },
      identity,
    );

    return response;
  }

  /**
   * Retrieves Twilio data based on the provided Caller and To parameters.
   *
   * @param {Object} options - The options object containing Caller and To properties.
   * @param {string} options.Caller - The caller identifier.
   * @param {string} options.To - The recipient identifier.
   * @returns {Promise<any>} - A promise that resolves to the Twilio data.
   */
  async getTwilioData({ Caller, To }: { Caller: string; To: string }) {
    // Case 1: Outgoing call initiated by the client
    if (Caller.startsWith('client:')) {
      // When a client makes an outgoing call, Caller contains 'client:USER_ID'
      // and To contains the called number. We need to extract the USER_ID
      // from Caller by removing the 'client:' prefix.
      // Note: USER_ID is used as the identity when generating the voice access token.
      return this.usersService.getTwilioDataFromUserId(
        Caller.replace('client:', ''),
      );
    }
    // Case 2: Incoming call to the client
    else if (To.startsWith('client:')) {
      // When updating call status info for an incoming call, To contains 'client:USER_ID'
      // and Caller contains the number of the caller. We need to extract the USER_ID
      // from To by removing the 'client:' prefix.
      return this.usersService.getTwilioDataFromUserId(
        To.replace('client:', ''),
      );
    }
    // Case 3: Outgoing call (when updating call status info)
    else {
      // When updating call status info for an outgoing call, Caller contains the
      // number making the call, and To contains the called number. In this case,
      // we need to get the Twilio data using the Caller's number.
      return this.usersService.getTwilioDataFromTwilioNumber(Caller);
    }
  }

  /**
   * Determines the direction of the call based on the caller's identifier.
   * If the caller starts with 'client:', the call is considered outgoing.
   * Otherwise, the call is considered incoming.
   *
   * @param caller - The identifier of the caller.
   * @returns The direction of the call ('outgoing' or 'incoming').
   */
  getDirection({ caller }: { caller: string }) {
    if (caller.startsWith('client:')) {
      return 'outgoing';
    } else {
      return 'incoming';
    }
  }

  /**
   * Returns the callback URL for updating call status information.
   * The URL is constructed by appending '/webhooks/twilio/update-call-status-info'
   * to the BASE_URL configuration value.
   *
   * @returns The callback URL for updating call status information.
   */
  getUpdateCallStatusCallbackUrl(): string {
    return (
      this.configService.get<string>('BASE_URL') +
      '/webhooks/twilio/update-call-status-info'
    );
  }
}
