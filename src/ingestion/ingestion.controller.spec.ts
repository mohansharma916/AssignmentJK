import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { sendIngestionDto } from './dto/send-ingestion.dto';
import { Ingestion } from '@prisma/client';

describe('IngestionController', () => {
  let controller: IngestionController;
  let service: IngestionService;

  // Mock ingestion service
  const mockIngestionService = {
    triggerPythonIngestion: jest.fn(),
    getProcessStatus: jest.fn(),
    getAllProcesses: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        {
          provide: IngestionService,
          useValue: mockIngestionService,
        },
      ],
    }).compile();

    controller = module.get<IngestionController>(IngestionController);
    service = module.get<IngestionService>(IngestionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('triggerIngestion', () => {
    const mockPayload: sendIngestionDto = {
      message: 'demo text 1',
    };

    it('should trigger ingestion process successfully', async () => {
      const expectedProcessId = 'process-123';
      mockIngestionService.triggerPythonIngestion.mockResolvedValue(
        expectedProcessId,
      );

      const result = await controller.triggerIngestion(mockPayload);

      expect(service.triggerPythonIngestion).toHaveBeenCalledWith(mockPayload);
      expect(result).toBe(expectedProcessId);
    });

    it('should handle ingestion trigger failure', async () => {
      const error = new Error('Failed to process message');
      mockIngestionService.triggerPythonIngestion.mockRejectedValue(error);

      await expect(controller.triggerIngestion(mockPayload)).rejects.toThrow(
        error,
      );
      expect(service.triggerPythonIngestion).toHaveBeenCalledWith(mockPayload);
    });

    it('should handle empty message payload', async () => {
      const emptyPayload: sendIngestionDto = {
        message: 'text demo 1',
      };

      const error = new Error('Invalid message content');
      mockIngestionService.triggerPythonIngestion.mockRejectedValue(error);

      await expect(controller.triggerIngestion(emptyPayload)).rejects.toThrow(
        error,
      );
    });
  });

  describe('getStatus', () => {
    it('should return process status when process exists', async () => {
      const processId = 'process-123';
      const status = 'PROCESSING';
      mockIngestionService.getProcessStatus.mockResolvedValue(status);

      const result = await controller.getStatus(processId);

      expect(service.getProcessStatus).toHaveBeenCalledWith(processId);
      expect(result).toBe(`Status of process ${processId}: ${status}`);
    });

    it('should return "Process not found" when process does not exist', async () => {
      const processId = 'non-existent';
      mockIngestionService.getProcessStatus.mockResolvedValue(null);

      const result = await controller.getStatus(processId);

      expect(service.getProcessStatus).toHaveBeenCalledWith(processId);
      expect(result).toBe('Process not found');
    });
  });

  describe('getAllProcesses', () => {
    it('should return all ingestion processes', async () => {
      const mockProcesses: Ingestion[] = [
        {
          id: '1',
          processId: 'process-1',
          status: 'COMPLETED',
          payload: 'demo text 1 ',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          processId: 'process-2',
          status: 'FAILED',
          payload: 'demo text 1 ',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockIngestionService.getAllProcesses.mockResolvedValue(mockProcesses);

      const result = await controller.getAllProcesses();

      expect(service.getAllProcesses).toHaveBeenCalled();
      expect(result).toEqual(mockProcesses);
    });

    it('should handle empty process list', async () => {
      mockIngestionService.getAllProcesses.mockResolvedValue([]);

      const result = await controller.getAllProcesses();

      expect(service.getAllProcesses).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('remove', () => {
    it('should remove a process successfully', async () => {
      const processId = 'process-123';
      const expectedResult = { deleted: true };
      mockIngestionService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(processId);

      expect(service.remove).toHaveBeenCalledWith(processId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle removal of non-existent process', async () => {
      const processId = 'non-existent';
      const error = new Error('Process not found');
      mockIngestionService.remove.mockRejectedValue(error);

      await expect(controller.remove(processId)).rejects.toThrow(error);
      expect(service.remove).toHaveBeenCalledWith(processId);
    });
  });
});
