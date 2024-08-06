import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  controllers: [],
  providers: [ActivitiesService, SupabaseService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
