import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { TwilioModule } from 'src/twilio/twilio.module';

@Module({
  imports: [TwilioModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
