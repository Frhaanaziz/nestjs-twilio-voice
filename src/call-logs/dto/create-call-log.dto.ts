import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCallLogDto {
  @IsString()
  call_sid: string;

  @IsOptional()
  @IsString()
  caller?: string | null;

  @IsOptional()
  @IsNumber()
  @IsInt()
  contact_id?: number | null;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsString()
  duration?: string | null;

  @IsOptional()
  @IsString()
  end_time?: string | null;

  @IsString()
  from: string;

  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsString()
  price?: string | null;

  @IsOptional()
  @IsString()
  price_unit?: string | null;

  @IsOptional()
  @IsString()
  receiver?: string | null;

  @IsOptional()
  @IsString()
  start_time?: string | null;

  @IsOptional()
  @IsString()
  status?: string | null;

  @IsString()
  to: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  recording_url?: string | null;

  @IsOptional()
  @IsDateString()
  updated_at?: string;
}
