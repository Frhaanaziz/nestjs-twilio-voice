import { Controller, Post, Body, Logger } from '@nestjs/common';
import { TwilioService } from 'src/twilio/twilio.service';
import { GenerateAccessTokenDto } from './dto/generate-access-token.dto';

@Controller('twilio')
export class TwilioController {
  private readonly logger = new Logger(TwilioController.name);
  constructor(private readonly twilioService: TwilioService) {}

  @Post('generate-access-token')
  async generateAccesToken(
    @Body() generateAccessTokenDto: GenerateAccessTokenDto,
  ) {
    const token = await this.twilioService.generateVoiceAccessToken({
      userId: generateAccessTokenDto.user_id,
    });

    return { data: { token } };
  }
}
