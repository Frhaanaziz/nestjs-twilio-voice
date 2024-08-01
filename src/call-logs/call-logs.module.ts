import { Module } from '@nestjs/common';
import { CallLogsService } from './call-logs.service';
import { CallLogsController } from './call-logs.controller';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  controllers: [CallLogsController],
  providers: [CallLogsService, SupabaseService],
  exports: [CallLogsService],
})
export class CallLogsModule {}
