import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { ConfigService } from '@nestjs/config';
import { TwilioController } from './twilio.controller';
import { CallLogsModule } from 'src/call-logs/call-logs.module';
import { UsersModule } from 'src/users/users.module';
import { ActivitiesModule } from 'src/activities/activities.module';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  imports: [CallLogsModule, UsersModule, ActivitiesModule],
  controllers: [TwilioController],
  providers: [TwilioService, ConfigService, SupabaseService],
  exports: [TwilioService],
})
export class TwilioModule {}
