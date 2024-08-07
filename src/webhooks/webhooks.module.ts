import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { TwilioModule } from 'src/twilio/twilio.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TwilioModule, UsersModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
