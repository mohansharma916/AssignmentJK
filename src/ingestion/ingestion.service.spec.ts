import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'nestjs-prisma';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { sendIngestionDto } from './dto/send-ingestion.dto';
import { Ingestion } from '@prisma/client';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: jest.fn().mockReturnValue({
    log: jest.fn(),
    error: jest.fn(),
  }),
}));

describe('IngestionService', () => {
  let service: IngestionService;
  let httpService: HttpService;
  let prismaService: PrismaService;

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockPrismaService = {
    ingestion: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    httpService = module.get<HttpService>(HttpService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('triggerPythonIngestion', () => {
    const mockPayload: sendIngestionDto = {
      message: 'Demo text 1',
    };

    it('should successfully trigger ingestion and create process record', async () => {
      const mockResponse = {
        data: {
          pid: '12345',
          message: 'Ingestion process started successfully',
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));
      mockPrismaService.ingestion.create.mockResolvedValue({
        id: '1',
        processId: '12345',
        status: 'InProgress',
        payload: mockPayload.message,
      });

      const result = await service.triggerPythonIngestion(mockPayload);

      expect(httpService.post).toHaveBeenCalledWith(
        'http://127.0.0.1:5000/start-ingestion',
        mockPayload,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
      expect(prismaService.ingestion.create).toHaveBeenCalledWith({
        data: {
          processId: '12345',
          status: 'InProgress',
          payload: mockPayload.message,
        },
      });
      expect(result).toBe(
        'Ingestion started: Ingestion process started successfully',
      );
    });

    it('should handle HTTP error from Python backend', async () => {
      const error = {
        response: {
          data: {
            message: 'Internal server error',
          },
        },
      };

      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.triggerPythonIngestion(mockPayload)).rejects.toThrow(
        new HttpException(
          'Failed to trigger ingestion: Internal server error',
          HttpStatus.BAD_GATEWAY,
        ),
      );
    });

    it('should handle network errors', async () => {
      const error = new Error('Network error');
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.triggerPythonIngestion(mockPayload)).rejects.toThrow(
        new HttpException(
          'Failed to trigger ingestion: Network error',
          HttpStatus.BAD_GATEWAY,
        ),
      );
    });
  });

  describe('getProcessStatus', () => {
    it('should return process status when process exists', async () => {
      const processId = 'process-123';
      const mockProcess = {
        id: '1',
        processId,
        status: 'InProgress',
        payload: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.ingestion.findUnique.mockResolvedValue(mockProcess);

      const result = await service.getProcessStatus(processId);

      expect(prismaService.ingestion.findUnique).toHaveBeenCalledWith({
        where: { processId },
      });
      expect(result).toBe('InProgress');
    });

    it('should throw NotFoundException when process does not exist', async () => {
      const processId = 'non-existent';
      mockPrismaService.ingestion.findUnique.mockResolvedValue(null);

      await expect(service.getProcessStatus(processId)).rejects.toThrow(
        new HttpException('Process not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('getAllProcesses', () => {
    it('should return all ingestion processes', async () => {
      const mockProcesses: Ingestion[] = [
        {
          id: '1',
          processId: 'process-1',
          status: 'Completed',
          payload: 'text 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          processId: 'process-2',
          status: 'InProgress',
          payload: 'text 2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.ingestion.findMany.mockResolvedValue(mockProcesses);

      const result = await service.getAllProcesses();

      expect(prismaService.ingestion.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockProcesses);
    });

    it('should return empty array when no processes exist', async () => {
      mockPrismaService.ingestion.findMany.mockResolvedValue([]);

      const result = await service.getAllProcesses();

      expect(prismaService.ingestion.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('remove', () => {
    it('should successfully remove a process', async () => {
      const processId = 'process-123';
      const mockDeletedProcess = {
        id: '1',
        processId,
        status: 'Completed',
        payload: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.ingestion.delete.mockResolvedValue(mockDeletedProcess);

      const result = await service.remove(processId);

      expect(prismaService.ingestion.delete).toHaveBeenCalledWith({
        where: { id: processId },
      });
      expect(result).toEqual(mockDeletedProcess);
    });

    it('should throw error when deleting non-existent process', async () => {
      const processId = 'non-existent';
      const error = new Error('Record not found');

      mockPrismaService.ingestion.delete.mockRejectedValue(error);

      await expect(service.remove(processId)).rejects.toThrow(error);
    });
  });
});
