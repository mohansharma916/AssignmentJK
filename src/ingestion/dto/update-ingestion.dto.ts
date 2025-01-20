import { PartialType } from '@nestjs/swagger';
import { sendIngestionDto } from './send-ingestion.dto';

export class UpdateIngestionDto extends PartialType(sendIngestionDto) {}
