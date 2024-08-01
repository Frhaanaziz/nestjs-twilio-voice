import { PartialType } from '@nestjs/mapped-types';
import { CreateCallLogDto } from './create-call-log.dto';

export class UpdateCallLogDto extends PartialType(CreateCallLogDto) {}
