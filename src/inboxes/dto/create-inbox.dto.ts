import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Database } from 'src/supabase/supabase.types';

export class CreateInboxDto {
  @IsOptional()
  @IsNumber()
  @IsInt()
  call_log_id?: number | null;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  email_id?: string | null;

  @IsOptional()
  @IsNumber()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsBoolean()
  is_read?: boolean;

  @IsNumber()
  @IsInt()
  organization_id: number;

  @IsString()
  subject: string;

  @IsOptional()
  @IsNumber()
  @IsInt()
  task_id?: number | null;

  @IsString()
  title: string;

  @IsString()
  type: Database['public']['Enums']['inbox_type'];

  @IsOptional()
  @IsDateString()
  updated_at?: string;

  @IsString()
  user_id: string;
}
