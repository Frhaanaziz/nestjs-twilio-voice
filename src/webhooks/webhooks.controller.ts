import { Controller, Post, Body, Header, Logger, Req } from '@nestjs/common';
import { TwilioService } from 'src/twilio/twilio.service';
import { TwilioVoiceWebhookDto } from 'src/twilio/dto/twilio-voice-webhook.dto';
import { ConfigService } from '@nestjs/config';
import { TwilioIncomingCallDto } from 'src/twilio/dto/twilio-incoming-call.dto';
import { UpdateTwilioCallStatusDto } from 'src/twilio/dto/update-twilio-call-status.dto';
import { UpdateTwilioRecordingInfoDto } from 'src/twilio/dto/update-twilio-recording-info.dto';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  constructor(
    private readonly twilioService: TwilioService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/twilio/voice')
  @Header('Content-Type', 'text/xml')
  async twilioVoiceHandler(
    @Req() req: Request,
    @Body() body: TwilioVoiceWebhookDto,
  ) {
    this.logger.verbose(`/webhooks/twilio/voice: ${JSON.stringify(body)}`);

    // Validate the Twilio request by checking the URL, signature, identity, and body
    // Make sure not to remove any fields from the body if they are not in the validation object
    await this.twilioService.validateTwilioRequest({
      url: this.configService.get('BASE_URL') + req.url,
      signature: req.headers['x-twilio-signature'],
      identity: body.Caller,
      body: body,
    });

    return this.twilioService.handleVoiceWebhook(body);
  }

  @Post('/twilio/incoming-call')
  @Header('Content-Type', 'text/xml')
  async twilioIncomingCallHandler(
    @Req() req: Request,
    @Body() body: TwilioIncomingCallDto,
  ) {
    this.logger.verbose(
      `/webhooks/twilio/incoming-call: ${JSON.stringify(body)}`,
    );

    await this.twilioService.validateTwilioRequest({
      url: this.configService.get('BASE_URL') + req.url,
      signature: req.headers['x-twilio-signature'],
      identity: body.To,
      body: body,
    });

    this.logger.verbose(
      '/webhooks/twilio/incoming-call: Incoming call received',
    );

    return this.twilioService.processIncomingCall(body);
  }

  @Post('/twilio/update-call-status-info')
  async updateTwilioCallStatus(
    @Req() req: Request,
    @Body() body: UpdateTwilioCallStatusDto,
  ) {
    this.logger.verbose(
      `/webhooks/twilio/update-call-status-info: ${JSON.stringify(body)}`,
    );

    // Validate the Twilio request by checking the URL, signature, identity, and body
    // Make sure not to remove any fields from the body if they are not in the validation object
    await this.twilioService.validateTwilioRequest({
      url: this.configService.get('BASE_URL') + req.url,
      signature: req.headers['x-twilio-signature'],
      identity: body.Caller.startsWith('client:') ? body.Caller : body.To,
      body,
    });

    return this.twilioService.updateCallStatusInfo(body);
  }

  @Post('/twilio/update-recording-info')
  async updateTwilioRecording(
    @Req() req: Request,
    @Body() body: UpdateTwilioRecordingInfoDto,
  ) {
    this.logger.verbose(
      `/webhooks/twilio/update-recording-info: ${JSON.stringify(body)}`,
    );

    // Validate the Twilio request by checking the URL, signature, identity, and body
    // Make sure not to remove any fields from the body if they are not in the validation object
    // await this.twilioService.validateTwilioRequest({
    //   url: this.configService.get('BASE_URL') + req.url,
    //   signature: req.headers['x-twilio-signature'],
    //   identity: body.Caller,
    //   body: body,
    // });

    return this.twilioService.updateRecordingInfo(body);
  }
}
