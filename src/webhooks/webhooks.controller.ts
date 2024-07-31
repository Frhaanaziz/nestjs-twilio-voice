import { Controller, Post, Body, Header, Logger, Req } from '@nestjs/common';
import { TwilioService } from 'src/twilio/twilio.service';
import { VoiceWebhookDto } from 'src/twilio/dto/voice-webhook.dto';
import { ConfigService } from '@nestjs/config';
import { IncomingCallDto } from 'src/twilio/dto/incoming-call.dto';
import { UpdateCallStatusDto } from 'src/twilio/dto/update-call-status.dto';

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
    @Body() voiceWebhookDto: VoiceWebhookDto,
  ) {
    this.logger.verbose(voiceWebhookDto, '/twilio/voice');

    // Validate the Twilio request by checking the URL, signature, identity, and body
    // Make sure not to remove any fields from the body if they are not in the validation object
    await this.twilioService.validateTwilioRequest({
      url: this.configService.get('BASE_URL') + req.url,
      signature: req.headers['x-twilio-signature'],
      identity: voiceWebhookDto.Caller,
      body: voiceWebhookDto,
    });

    this.logger.verbose('Validated Twilio request', '/twilio/voice');

    return this.twilioService.handleVoiceWebhook(voiceWebhookDto);
  }

  @Post('/twilio/incoming-call')
  @Header('Content-Type', 'text/xml')
  async twilioIncomingCallHandler(
    @Req() req: Request,
    @Body() incomingCallDto: IncomingCallDto,
  ) {
    this.logger.verbose(incomingCallDto, '/twilio/incoming-call');

    // await this.twilioService.validateTwilioRequest({
    //   url: this.configService.get('BASE_URL') + req.url,
    //   signature: req.headers['x-twilio-signature'],
    //   identity: incomingCallDto.Caller,
    //   body: incomingCallDto,
    // });

    return this.twilioService.processIncomingCall({
      fromNumber: incomingCallDto.From,
      toNumber: incomingCallDto.To,
    });

    // await this.callLogService.createCallLog(incomingCallDto);
  }

  @Post('/twilio/update-call-status-info')
  async updateTwilioCallStatus(
    @Req() req: Request,
    @Body() updateCallStatusDto: UpdateCallStatusDto,
  ) {
    this.logger.verbose(updateCallStatusDto, '/twilio/update-call-status-info');

    // Validate the Twilio request by checking the URL, signature, identity, and body
    // Make sure not to remove any fields from the body if they are not in the validation object
    await this.twilioService.validateTwilioRequest({
      url: this.configService.get('BASE_URL') + req.url,
      signature: req.headers['x-twilio-signature'],
      identity: updateCallStatusDto.Caller,
      body: updateCallStatusDto,
    });

    this.logger.verbose(
      'Validated Twilio request',
      '/twilio/update-call-status-info',
    );

    return this.twilioService.updateCallStatusInfo(updateCallStatusDto);
  }

  @Post('/twilio/update-recording-info')
  async updateTwilioRecording(@Req() req: Request, @Body() body: any) {
    this.logger.verbose(body, '/twilio/update-recording-info');
  }
}
