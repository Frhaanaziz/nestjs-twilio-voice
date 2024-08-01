import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env.validation';
import { SupabaseModule } from './supabase/supabase.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { TwilioModule } from './twilio/twilio.module';
import { CallLogsModule } from './call-logs/call-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
    }),
    SupabaseModule,
    WebhooksModule,
    TwilioModule,
    CallLogsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
