import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateCallLogDto } from './dto/create-call-log.dto';
import { UpdateCallLogDto } from './dto/update-call-log.dto';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/supabase/supabase.types';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class CallLogsService {
  private readonly logger = new Logger(CallLogsService.name);
  private readonly supabase: SupabaseClient<Database>;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async create(createCallLogDto: CreateCallLogDto) {
    const { error } = await this.supabase
      .from('Call_Logs')
      .insert(createCallLogDto);
    if (error) {
      this.logger.error(`create: ${JSON.stringify(error)}`);
      throw new BadRequestException(error.message);
    }
  }

  async update({
    match,
    data,
  }: {
    match: UpdateCallLogDto;
    data: UpdateCallLogDto;
  }) {
    const { error } = await this.supabase
      .from('Call_Logs')
      .update(data)
      .match({ ...match });
    if (error) {
      this.logger.error(`update:  ${JSON.stringify(error)}`);
      throw new BadRequestException(error.message);
    }
  }
}
