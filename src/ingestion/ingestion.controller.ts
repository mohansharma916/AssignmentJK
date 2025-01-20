import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { sendIngestionDto } from './dto/send-ingestion.dto';
import { Ingestion } from '@prisma/client';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('trigger')
  async triggerIngestion(@Body() payload: sendIngestionDto): Promise<string> {
    const result = await this.ingestionService.triggerPythonIngestion(payload);
    return result;
  }

  @Get('status/:id')
  async getStatus(@Param('id') processId: string): Promise<string> {
    const status = await this.ingestionService.getProcessStatus(processId);
    if (!status) {
      return 'Process not found';
    }
    return `Status of process ${processId}: ${status}`;
  }

  @Get('all')
  async getAllProcesses(): Promise<Ingestion[]> {
    const processes = await this.ingestionService.getAllProcesses();
    return processes;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingestionService.remove(id);
  }
}
