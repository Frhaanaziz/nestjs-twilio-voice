import {
  Controller,
  Post,
  Body,
  Header,
  Logger,
  Req,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { TwilioService } from 'src/twilio/twilio.service';
import { TwilioVoiceWebhookDto } from 'src/twilio/dto/twilio-voice-webhook.dto';
import { ConfigService } from '@nestjs/config';
import { TwilioIncomingCallDto } from 'src/twilio/dto/twilio-incoming-call.dto';
import { UpdateTwilioCallStatusDto } from 'src/twilio/dto/update-twilio-call-status.dto';
import * as twilio from 'twilio';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  constructor(
    private readonly twilioService: TwilioService,
    private readonly configService: ConfigService,
  ) {}

  private async validateTwilioRequest({
    signature,
    url,
    body,
    Caller,
    To,
  }: {
    signature: string;
    url: string;
    body: any;
    Caller: string;
    To: string;
  }) {
    const { twilioSetting } = await this.twilioService.getTwilioData({
      Caller,
      To,
    });
    if (!twilioSetting) {
      this.logger.error('validateTwilioRequest: Twilio Setting not found');
      throw new BadRequestException('Twilio Setting not found');
    }
    if (!twilioSetting.auth_token) {
      this.logger.error('validateTwilioRequest: Twilio Auth Token not found');
      throw new BadRequestException('Twilio Auth Token not found');
    }

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

  @Post('/twilio/voice')
  @Header('Content-Type', 'text/xml')
  async twilioVoiceHandler(
    @Req() req: Request,
    @Body() body: TwilioVoiceWebhookDto,
  ) {
    this.logger.verbose(
      `/webhooks/twilio/voice (body): ${JSON.stringify(body)}`,
    );

    // Validate the Twilio request by checking the URL, signature, identity, and body
    // Make sure not to remove any fields from the body if they are not in the validation object
    await this.validateTwilioRequest({
      url: this.configService.get('BASE_URL') + req.url,
      signature: req.headers['x-twilio-signature'],
      Caller: body.Caller, // client:USER_ID
      To: body.To,
      body: body,
    });

    const resp = await this.twilioService.handleVoiceWebhook(body);

    return resp.toString();
  }

  @Post('/twilio/incoming-call')
  @Header('Content-Type', 'text/xml')
  async twilioIncomingCallHandler(
    @Req() req: Request,
    @Body() body: TwilioIncomingCallDto,
  ) {
    this.logger.verbose(
      `/webhooks/twilio/incoming-call (body): ${JSON.stringify(body)}`,
    );

    await this.validateTwilioRequest({
      url: this.configService.get('BASE_URL') + req.url,
      signature: req.headers['x-twilio-signature'],
      Caller: body.Caller,
      To: body.To, // twilio_number
      body: body,
    });

    const resp = await this.twilioService.processIncomingCallWebhook(body);

    return resp.toString();
  }

  @Post('/twilio/update-call-status-info')
  async updateTwilioCallStatus(
    @Req() req: Request,
    @Body() body: UpdateTwilioCallStatusDto,
  ) {
    this.logger.verbose(
      `/webhooks/twilio/update-call-status-info (body): ${JSON.stringify(body)}`,
    );

    // Validate the Twilio request by checking the URL, signature, identity, and body
    // Make sure not to remove any fields from the body if they are not in the validation object
    await this.validateTwilioRequest({
      url: this.configService.get('BASE_URL') + req.url,
      signature: req.headers['x-twilio-signature'],
      Caller: body.Caller,
      To: body.To,
      body,
    });

    return this.twilioService.updateCallStatusInfo(body);
  }
}
