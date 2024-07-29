import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from 'src/supabase/supabase.service';
import { TwilioController } from './twilio.controller';

@Module({
  controllers: [TwilioController],
  providers: [TwilioService, ConfigService, SupabaseService],
  exports: [TwilioService],
})
export class TwilioModule {}
