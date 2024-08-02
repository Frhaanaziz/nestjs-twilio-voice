import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/supabase/supabase.types';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly supabase: SupabaseClient<Database>;

  constructor(private readonly supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async getTwilioDataFromTwilioNumber(twilio_number: string) {
    const { data: user, error: userError } = await this.supabase
      .from('Users')
      .select(
        '*, twilioSetting: Twilio_Settings(*), twilioAgent: Twilio_Agents!inner(*)',
      )
      .eq('twilioAgent.twilio_number', twilio_number)
      .single();
    if (userError) {
      this.logger.error(`getTwilioDataFromTwilioNumber: ${userError.message}`);
      throw new BadRequestException(userError);
    }

    return user;
  }

  async getTwilioDataFromUserId(user_id: string) {
    const { data: user, error: userError } = await this.supabase
      .from('Users')
      .select(
        '*, twilioSetting: Twilio_Settings(*), twilioAgent: Twilio_Agents(*)',
      )
      .eq('id', user_id)
      .single();
    if (userError) {
      this.logger.error(`getTwilioDataFromUserId: ${userError.message}`);
      throw new BadRequestException(userError);
    }

    return user;
  }
}
