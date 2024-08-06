import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/supabase/supabase.types';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);
  private readonly supabase: SupabaseClient<Database>;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async create(
    createActivityDto: Database['public']['Tables']['Activities']['Insert'],
  ) {
    const { error } = await this.supabase
      .from('Activities')
      .insert(createActivityDto);
    if (error) {
      this.logger.error(`create: ${JSON.stringify(error)}`);
      throw new BadRequestException(error.message);
    }
  }

  async createWithParticipant({
    activity,
    participants,
  }: {
    activity: Database['public']['Tables']['Activities']['Insert'];
    participants: Omit<
      Database['public']['Tables']['Activity_Participants']['Insert'],
      'activity_id'
    >[];
  }) {
    const { data, error: activityError } = await this.supabase
      .from('Activities')
      .insert(activity)
      .select('id')
      .single();
    if (activityError) {
      this.logger.error(
        `createWithParticipant: ${JSON.stringify(activityError)}`,
      );
      throw new BadRequestException(activityError.message);
    }

    const { error: participantError } = await this.supabaseService
      .getClient()
      .from('Activity_Participants')
      .insert(
        participants.map((participant) => ({
          activity_id: data.id,
          ...participant,
        })),
      );
    if (participantError) {
      this.logger.error(
        `createWithParticipant: ${JSON.stringify(participantError)}`,
      );
      throw new BadRequestException(participantError.message);
    }
  }

  async update({
    match,
    data,
  }: {
    match: Database['public']['Tables']['Activities']['Update'];
    data: Database['public']['Tables']['Activities']['Update'];
  }) {
    const { error } = await this.supabase
      .from('Activities')
      .update(data)
      .match({ ...match });
    if (error) {
      this.logger.error(`update:  ${JSON.stringify(error)}`);
      throw new BadRequestException(error.message);
    }
  }
}
