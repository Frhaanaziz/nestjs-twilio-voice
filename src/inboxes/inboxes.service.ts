import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateInboxDto } from './dto/create-inbox.dto';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/supabase/supabase.types';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class InboxesService {
  private readonly logger = new Logger(InboxesService.name);
  private readonly supabase: SupabaseClient<Database>;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async create(createCallLogDto: CreateInboxDto) {
    const { error } = await this.supabase
      .from('Inboxes')
      .insert(createCallLogDto);
    if (error) {
      this.logger.error(`create: ${JSON.stringify(error)}`);
      throw new BadRequestException(error.message);
    }
  }
}
