import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  controllers: [],
  providers: [UsersService, SupabaseService],
  exports: [UsersService],
})
export class UsersModule {}
