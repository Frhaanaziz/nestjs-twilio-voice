import { Module } from '@nestjs/common';
import { InboxesService } from './inboxes.service';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  controllers: [],
  providers: [InboxesService, SupabaseService],
  exports: [InboxesService],
})
export class InboxesModule {}
