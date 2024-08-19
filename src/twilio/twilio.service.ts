import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import { TwilioVoiceWebhookDto } from './dto/twilio-voice-webhook.dto';
import { TwilioAgent, TwilioSetting } from './twilio.interface';
import { UpdateTwilioCallStatusDto } from './dto/update-twilio-call-status.dto';
import { Database } from 'src/supabase/supabase.types';
import { CallLogsService } from 'src/call-logs/call-logs.service';
import { TwilioIncomingCallDto } from './dto/twilio-incoming-call.dto';
import { UsersService } from 'src/users/users.service';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import { ActivitiesService } from 'src/activities/activities.service';
import { User } from 'src/users/user.interface';
import { SupabaseService } from 'src/supabase/supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { InboxesService } from 'src/inboxes/inboxes.service';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private readonly supabase: SupabaseClient<Database>;

  constructor(
    private readonly configService: ConfigService,
    private readonly callLogsService: CallLogsService,
    private readonly usersService: UsersService,
    private readonly activitiesService: ActivitiesService,
    private readonly supabaseService: SupabaseService,
    private readonly inboxesService: InboxesService,
  ) {
    this.supabase = this.supabaseService.getClient();
  }

  getClient({ twilioSetting }: { twilioSetting: TwilioSetting }) {
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

  async handleVoiceWebhook({
    data,
    twilioAgent,
    twilioSetting,
  }: {
    data: TwilioVoiceWebhookDto;
    twilioAgent: TwilioAgent;
    twilioSetting: TwilioSetting;
  }) {
    if (!twilioAgent.twilio_number) {
      this.logger.error('handleVoiceWebhook: Twilio Number is not set');
      throw new BadRequestException('Twilio Number is not set');
    }

    const resp = this.generateDialResponse({
      fromNumber: twilioAgent.twilio_number,
      toNumber: data.To,
      twilioSetting,
      statusCallbackUrl:
        this.configService.get<string>('BASE_URL') +
        '/webhooks/twilio/update-outgoing-call-status',
    });

    await Promise.all([
      this.callLogsService.create({
        call_sid: data.CallSid,
        type: this.getDirection({ caller: data.Caller }),
        caller: data.Caller,
        from: data.From,
        to: data.To,
        contact_id: parseInt(data.contact_id),
      }),
      this.activitiesService.createWithParticipant({
        activity: {
          call_sid: data.CallSid,
          type: 'attempted to call',
          lead_id: data.lead_id ? parseInt(data.lead_id) : null,
          opportunity_id: data.opportunity_id
            ? parseInt(data.opportunity_id)
            : null,
          organization_id: parseInt(data.organization_id),
          user_id: data.user_id,
          subject: `Attempted to call {{called}}`,
        },
        participants: [
          { role: 'called', contact_id: parseInt(data.contact_id) },
        ],
      }),
    ]);

    return resp;
  }

  async processIncomingCallWebhook({
    data,
    user,
  }: {
    data: TwilioIncomingCallDto;
    user: User & {
      twilioAgent?: TwilioAgent | null;
      twilioSetting?: TwilioSetting | null;
    };
  }) {
    let resp: VoiceResponse;

    const { data: contact, error: contactError } = await this.supabase
      .from('Contacts')
      .select('id, company: Companies(id)')
      // add user_id to the match?
      .match({ mobile_phone: data.From, organization_id: user.organization_id })
      .limit(1)
      .single();
    if (contactError && contactError.code !== 'PGRST116') {
      this.logger.error(`processIncomingCallWebhook: ${contactError.message}`);
      throw new InternalServerErrorException(contactError.message);
    }

    let lead: { id: number } | null = null;
    if (contact) {
      const { data, error: leadError } = await this.supabase
        .from('Leads')
        .select('id')
        // add user_id to the match?
        .match({
          company_id: contact.company.id,
          organization_id: user.organization_id,
        })
        .limit(1)
        .single();
      if (leadError && leadError.code !== 'PGRST116') {
        this.logger.error(`processIncomingCallWebhook: ${leadError.message}`);
        throw new InternalServerErrorException(leadError.message);
      }
      lead = data;
    }

    const callLog = await this.callLogsService.create({
      call_sid: data.CallSid,
      type: this.getDirection({ caller: data.Caller }),
      caller: data.Caller,
      receiver: data.Called,
      status: data.CallStatus,
      to: data.To,
      from: data.From,
    });

    // If the user is set to receive calls on their phone, dial the user's phone number
    if (user.twilioAgent.call_receiving_device === 'Phone') {
      // If the user's phone number is not set, inform the caller that the agent is unavailable
      if (!user.phone) {
        const response = new twilio.twiml.VoiceResponse();
        response.say(
          'Agent is unavailable to take the call, please call after some time.',
        );
        resp = response.toString();

        await this.inboxesService.create({
          organization_id: user.organization_id,
          user_id: user.id,
          subject: 'Missed call',
          type: 'call',
          call_log_id: callLog.id,
          title: '',
          description: data.From,
        });
      } else {
        resp = this.generateDialResponse({
          fromNumber: data.From,
          toNumber: user.phone,
          twilioSetting: user.twilioSetting,
          statusCallbackUrl:
            this.configService.get<string>('BASE_URL') +
            '/webhooks/twilio/update-incoming-call-status',
        });
      }
    } else {
      resp = this.generateClientResponse({
        identity: user.id,
        twilioSetting: user.twilioSetting,
        statusCallbackUrl:
          this.configService.get<string>('BASE_URL') +
          '/webhooks/twilio/update-incoming-call-status',
      });
    }

    if (lead) {
      await this.activitiesService.createWithParticipant({
        activity: {
          organization_id: user.organization_id,
          user_id: user.id,
          type: 'missed call',
          subject: 'Missed call from {{caller}}',
          call_sid: data.CallSid,
          lead_id: lead.id,
        },
        participants: [{ role: 'caller', contact_id: contact.id }],
      });
    }

    return resp;
  }

  async updateOutgoingCallStatus({
    data,
    twilioSetting,
  }: {
    data: UpdateTwilioCallStatusDto;
    twilioSetting: TwilioSetting;
  }) {
    try {
      const twilioClient = this.getClient({ twilioSetting });

      // If the call is not completed, send a user-defined message to the parent call. This is used to update the call status in the client application.
      // Note: The user-defined message is only sent for ongoing calls.
      if (data.CallStatus === 'in-progress' || data.CallStatus === 'ringing') {
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
          receiver: data.Called,
          price: callDetails.price,
          price_unit: callDetails.priceUnit,
          recording_url: data.RecordingUrl, // Recording URL is only available for completed calls
          start_time: callDetails.startTime?.toISOString(),
          end_time: callDetails.startTime?.toISOString(),
        },
      });

      if (
        data.CallStatus === 'in-progress' ||
        data.CallStatus === 'completed'
      ) {
        await this.activitiesService.update({
          match: { call_sid: data.ParentCallSid },
          data: {
            type: 'called',
            subject: 'Called {{called}}',
          },
        });
      }
    } catch (error) {
      this.logger.error(`updateOutgoingCallStatus: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  async updateIncomingCallStatus({
    data,
    user,
  }: {
    data: UpdateTwilioCallStatusDto;
    user: User & { twilioSetting: TwilioSetting };
  }) {
    try {
      const twilioClient = this.getClient({
        twilioSetting: user.twilioSetting,
      });

      // If the call is not completed, send a user-defined message to the parent call. This is used to update the call status in the client application.
      // Note: The user-defined message is only sent for ongoing calls.
      if (data.CallStatus === 'in-progress' || data.CallStatus === 'ringing') {
        await twilioClient
          .calls(data.ParentCallSid)
          .userDefinedMessages.create({
            content: JSON.stringify(data),
          });
      }

      // Get the call details using the parent call SID and update the call status information.
      const callDetails = await twilioClient.calls(data.ParentCallSid).fetch();

      const callLogs = await this.callLogsService.update({
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

      if (
        data.CallStatus === 'in-progress' ||
        data.CallStatus === 'completed'
      ) {
        await this.activitiesService.update({
          match: { call_sid: data.ParentCallSid },
          data: {
            type: 'incoming call',
            subject: `Incoming call from {{caller}}`,
          },
        });
      }

      if (data.CallStatus === 'busy' || data.CallStatus === 'no-answer') {
        await Promise.all(
          callLogs.map((callLog) =>
            this.inboxesService.create({
              organization_id: user.organization_id,
              user_id: user.id,
              subject: 'Missed call',
              type: 'call',
              call_log_id: callLog.id,
              title: '',
              description: data.From,
            }),
          ),
        );
      }
    } catch (error) {
      this.logger.error(`updateIncomingCallStatus: ${error.message}`);
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
    statusCallbackUrl,
  }: {
    fromNumber: string;
    toNumber: string;
    twilioSetting: TwilioSetting;
    statusCallbackUrl: string;
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
        statusCallback: statusCallbackUrl,
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
    statusCallbackUrl,
  }: {
    identity: string;
    twilioSetting: TwilioSetting;
    statusCallbackUrl: string;
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
        statusCallback: statusCallbackUrl,
        statusCallbackMethod: 'POST',
      },
      identity,
    );

    return response;
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
}
