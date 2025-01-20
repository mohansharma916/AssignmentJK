import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { sendIngestionDto } from './dto/send-ingestion.dto';
import { PrismaService } from 'nestjs-prisma';
import { Ingestion } from '@prisma/client';

@Injectable()
export class IngestionService {
  private readonly prisma: PrismaService;
  private readonly logger = new Logger(IngestionService.name);

  constructor(private readonly httpService: HttpService) {}

  async triggerPythonIngestion(payload: sendIngestionDto) {
    const pythonBackendUrl = 'http://127.0.0.1:5000/start-ingestion';

    try {
      const response = await lastValueFrom(
        this.httpService.post(pythonBackendUrl, payload, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const processId = response.data.pid;
      if (processId) {
        await this.prisma.ingestion.create({
          data: {
            processId: processId.toString(),
            status: 'InProgress',
            payload: payload.message,
          },
        });
      }

      this.logger.log(`Ingestion started: ${response.data.message}`);
      return `Ingestion started: ${response.data.message}`;
    } catch (error) {
      this.logger.error('Failed to trigger ingestion:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Unknown error';
      throw new HttpException(
        `Failed to trigger ingestion: ${errorMessage}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getProcessStatus(processId: string): Promise<string> {
    console.log('processData', processId);
    const status = await this.prisma.ingestion.findUnique({
      where: { processId },
    });
    console.log('processData', status);

    if (!status) {
      throw new HttpException('Process not found', HttpStatus.NOT_FOUND);
    }
    return status.status;
  }

  async getAllProcesses(): Promise<Ingestion[]> {
    return await this.prisma.ingestion.findMany();
  }

  async remove(id: string) {
    return await this.prisma.ingestion.delete({ where: { id } });
  }
}
