import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
  controllers: [],
  providers: [SupabaseService],
})
export class SupabaseModule {}
