import { Controller, Post, Body, Logger } from '@nestjs/common';
import { TwilioService } from 'src/twilio/twilio.service';
import { GenerateTwilioAccessTokenDto } from './dto/generate-twilio-access-token.dto';

@Controller('twilio')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  @Post('generate-access-token')
  async generateAccesToken(@Body() body: GenerateTwilioAccessTokenDto) {
    const token = await this.twilioService.generateVoiceAccessToken(body);

    return { data: { token } };
  }
}
