import { Controller } from '@nestjs/common';
import { CallLogsService } from './call-logs.service';

@Controller('call-logs')
export class CallLogsController {
  constructor(private readonly callLogsService: CallLogsService) {}
}
