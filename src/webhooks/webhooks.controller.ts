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
import { UsersService } from 'src/users/users.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  constructor(
    private readonly twilioService: TwilioService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/twilio/voice')
  @Header('Content-Type', 'text/xml')
  async twilioVoiceHandler(
    @Req() req: Request,
    @Body() body: TwilioVoiceWebhookDto,
  ) {
    this.logger.verbose(`/webhooks/twilio/voice: ${JSON.stringify(body)}`);

    const { twilioAgent, twilioSetting } =
      await this.usersService.getTwilioDataFromUserId(
        body.Caller.replace('client:', ''),
      );

    // Validate the Twilio request by checking the URL, signature, identity, and body
    // Make sure not to remove any fields from the body if they are not in the validation object
    const isValid = twilio.validateRequest(
      twilioSetting.auth_token,
      req.headers['x-twilio-signature'],
      this.configService.get('BASE_URL') + req.url,
      body,
    );
    if (!isValid) {
      this.logger.error('/twilio/voice: Invalid Twilio Request');
      throw new BadRequestException('Invalid Twilio Request');
    }

    const resp = await this.twilioService.handleVoiceWebhook({
      data: body,
      twilioAgent,
      twilioSetting,
    });

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

    const user = await this.usersService.getTwilioDataFromTwilioNumber(body.To);

    // Validate the Twilio request by checking the URL, signature, identity, and body
    // Make sure not to remove any fields from the body if they are not in the validation object
    const isValid = twilio.validateRequest(
      user.twilioSetting.auth_token,
      req.headers['x-twilio-signature'],
      this.configService.get('BASE_URL') + req.url,
      body,
    );
    if (!isValid) {
      this.logger.error('/twilio/incoming-call: Invalid Twilio Request');
      throw new BadRequestException('Invalid Twilio Request');
    }

    const resp = await this.twilioService.processIncomingCallWebhook({
      data: body,
      user,
    });

    return resp.toString();
  }

  @Post('/twilio/update-incoming-call-status')
  async updateIncomingCallStatus(
    @Req() req: Request,
    @Body() body: UpdateTwilioCallStatusDto,
  ) {
    this.logger.verbose(
      `/webhooks/twilio/update-incoming-call-status: ${JSON.stringify(body)}`,
    );

    const user = await this.usersService.getTwilioDataFromUserId(
      body.To.replace('client:', ''),
    );

    // Validate the Twilio request by checking the URL, signature, identity, and body
    // Make sure not to remove any fields from the body if they are not in the validation object
    const isValid = twilio.validateRequest(
      user.twilioSetting.auth_token,
      req.headers['x-twilio-signature'],
      this.configService.get('BASE_URL') + req.url,
      body,
    );
    if (!isValid) {
      this.logger.error(
        '/twilio/update-incoming-call-status: Invalid Twilio Request',
      );
      throw new BadRequestException('Invalid Twilio Request');
    }

    return this.twilioService.updateIncomingCallStatus({
      data: body,
      user,
    });
  }

  @Post('/twilio/update-outgoing-call-status')
  async updateOutgoingCallStatus(
    @Req() req: Request,
    @Body() body: UpdateTwilioCallStatusDto,
  ) {
    this.logger.verbose(
      `/webhooks/twilio/update-outgoing-call-status: ${JSON.stringify(body)}`,
    );

    const { twilioSetting } =
      await this.usersService.getTwilioDataFromTwilioNumber(body.Caller);

    // Validate the Twilio request by checking the URL, signature, identity, and body
    // Make sure not to remove any fields from the body if they are not in the validation object
    const isValid = twilio.validateRequest(
      twilioSetting.auth_token,
      req.headers['x-twilio-signature'],
      this.configService.get('BASE_URL') + req.url,
      body,
    );
    if (!isValid) {
      this.logger.error(
        '/twilio/update-outgoing-call-status: Invalid Twilio Request',
      );
      throw new BadRequestException('Invalid Twilio Request');
    }

    return this.twilioService.updateOutgoingCallStatus({
      data: body,
      twilioSetting,
    });
  }
}
