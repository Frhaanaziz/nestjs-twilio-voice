import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from 'src/supabase/supabase.service';
import { TwilioController } from './twilio.controller';
import { CallLogsModule } from 'src/call-logs/call-logs.module';

@Module({
  imports: [CallLogsModule],
  controllers: [TwilioController],
  providers: [TwilioService, ConfigService, SupabaseService],
  exports: [TwilioService],
})
export class TwilioModule {}
