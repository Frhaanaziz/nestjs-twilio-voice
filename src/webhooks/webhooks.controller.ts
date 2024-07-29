import {
  Controller,
  Post,
  Body,
  Header,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { TwilioService } from 'src/twilio/twilio.service';
import { VoiceWebhookDto } from 'src/twilio/dto/voice-webhook.dto';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  constructor(private readonly twilioService: TwilioService) {}

  @Post('/twilio/voice')
  @Header('Content-Type', 'text/xml')
  async voice(@Body() voiceWebhookDto: VoiceWebhookDto) {
    this.logger.log(voiceWebhookDto, '/twilio/voice');

    const twilio = this.twilioService.getClient({
      accountSid: voiceWebhookDto.AccountSid,
      twimlSid: voiceWebhookDto.ApplicationSid,
    });
    if (!twilio) throw new InternalServerErrorException('Twilio not connected');

    const fromNumber = await this.twilioService.getCallerNumber(
      voiceWebhookDto.Caller,
    );

    return this.twilioService.generateTwilioDialResponse(
      fromNumber,
      voiceWebhookDto.To,
    );

    // const callDetails = {
    //   ...args,
    //   call_from: fromNumber,
    // };
    // await this.callLogService.createCallLog(callDetails);

    // return resp
  }

  @Post('/twilio/incoming-call')
  @Header('Content-Type', 'text/xml')
  async twilioIncomingCallHandler(@Body() body: any) {
    this.logger.log(body, 'incoming-call');
    // const callDetails = {
    //   ...args,
    // };
    // await this.callLogService.createCallLog(callDetails);

    // const resp = await this.twilioService.processIncomingCall(
    //   args.From,
    //   args.To,
    // );

    // return resp
  }

  @Post('/twilio/update-call-status-info')
  async updateTwilioCallStatus(@Body() body: any) {
    this.logger.log(body, '/twilio/update-call-status-info');
  }

  @Post('/twilio/update-recording-info')
  async updateTwilioRecording(@Body() body: any) {
    this.logger.log(body, '/twilio/update-recording-info');
  }
}
