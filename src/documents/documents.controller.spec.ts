import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { createReadStream } from 'fs';
import { StreamableFile } from '@nestjs/common';
import { Role } from 'src/auth/role.enum';
import { User } from 'src/users/entities/user.entity';

jest.mock('fs', () => ({
  createReadStream: jest.fn(),
}));

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;

  const mockDocumentsService = {
    getUploadResponse: jest.fn(),
    createDocument: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser: Partial<User> = {
    id: '123',
    email: 'test@example.com',
    role: Role.ADMIN,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadSingle', () => {
    it('should upload a file successfully', async () => {
      const mockFile = {
        filename: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      };
      const mockHeaders = { host: 'localhost:3000' };
      const mockResponse = { url: 'http://localhost:3000/documents/test.pdf' };

      mockDocumentsService.getUploadResponse.mockResolvedValue(mockResponse);

      const result = await controller.uploadSingle(mockFile, mockHeaders);

      expect(service.getUploadResponse).toHaveBeenCalledWith(
        mockFile,
        'localhost:3000',
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getFile', () => {
    it('should return a StreamableFile', () => {
      const mockParams = { name: 'test.pdf' };
      const mockReadStream = {} as any;
      (createReadStream as jest.Mock).mockReturnValue(mockReadStream);

      const result = controller.getFile(mockParams);

      expect(createReadStream).toHaveBeenCalled();
      expect(result).toBeInstanceOf(StreamableFile);
    });
  });

  describe('createDocument', () => {
    it('should create a document', async () => {
      const createDocumentDto = {
        documentTitle: 'Test Document',
        documentUrl: 'http://example.com/test.pdf',
      };
      const expectedResult = {
        id: '1',
        ...createDocumentDto,
        userId: mockUser.id,
      };

      mockDocumentsService.createDocument.mockResolvedValue(expectedResult);

      const result = await controller.createDocument(
        mockUser as User,
        createDocumentDto,
      );

      expect(service.createDocument).toHaveBeenCalledWith(
        createDocumentDto,
        mockUser.id,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return an array of documents', async () => {
      const expectedResult = [
        { id: '1', title: 'Doc 1' },
        { id: '2', title: 'Doc 2' },
      ];

      mockDocumentsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single document', async () => {
      const documentId = '1';
      const expectedResult = {
        id: documentId,
        title: 'Test Document',
      };

      mockDocumentsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(documentId);

      expect(service.findOne).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      const documentId = '1';
      const updateDocumentDto = {
        documentTitle: 'Updated Title',
      };
      const expectedResult = {
        id: documentId,
        ...updateDocumentDto,
      };

      mockDocumentsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(documentId, updateDocumentDto);

      expect(service.update).toHaveBeenCalledWith(
        documentId,
        updateDocumentDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a document', async () => {
      const documentId = '1';
      const expectedResult = { deleted: true };

      mockDocumentsService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(documentId);

      expect(service.remove).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(expectedResult);
    });
  });
});
