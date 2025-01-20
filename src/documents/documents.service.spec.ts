import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { PrismaService } from 'nestjs-prisma';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    document: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUploadResponse', () => {
    it('should return formatted upload response with correct URL', () => {
      const mockFile = {
        originalname: 'test.pdf',
        filename: 'test-123.pdf',
      };
      const mockOrigin = 'example.com';

      const result = service.getUploadResponse(mockFile, mockOrigin);

      expect(result).toEqual({
        originalname: 'test.pdf',
        filename: 'test-123.pdf',
        url: `https://${mockOrigin}/documents/test-123.pdf`,
      });
    });
  });

  describe('createDocument', () => {
    it('should create a new document', async () => {
      const createDocumentDto: CreateDocumentDto = {
        documentTitle: 'Test Document',
        documentUrl: 'https://example.com/test.pdf',
      };
      const userId = 'user-123';
      const expectedDocument = {
        id: 'doc-123',
        ...createDocumentDto,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.document.create.mockResolvedValue(expectedDocument);

      const result = await service.createDocument(createDocumentDto, userId);

      expect(mockPrismaService.document.create).toHaveBeenCalledWith({
        data: {
          documentTitle: createDocumentDto.documentTitle,
          documentUrl: createDocumentDto.documentUrl,
          userId,
        },
      });
      expect(result).toEqual(expectedDocument);
    });

    it('should throw an error if prisma create fails', async () => {
      const createDocumentDto: CreateDocumentDto = {
        documentTitle: 'Test Document',
        documentUrl: 'https://example.com/test.pdf',
      };
      const userId = 'user-123';
      const prismaError = new Error('Prisma error');

      mockPrismaService.document.create.mockRejectedValue(prismaError);

      await expect(
        service.createDocument(createDocumentDto, userId),
      ).rejects.toThrow(prismaError);
    });
  });

  describe('findAll', () => {
    it('should return all documents', async () => {
      const expectedDocuments = [
        {
          id: 'doc-1',
          documentTitle: 'Document 1',
          documentUrl: 'https://example.com/1.pdf',
          userId: 'user-1',
        },
        {
          id: 'doc-2',
          documentTitle: 'Document 2',
          documentUrl: 'https://example.com/2.pdf',
          userId: 'user-2',
        },
      ];

      mockPrismaService.document.findMany.mockResolvedValue(expectedDocuments);

      const result = await service.findAll();

      expect(mockPrismaService.document.findMany).toHaveBeenCalled();
      expect(result).toEqual(expectedDocuments);
    });
  });

  describe('findOne', () => {
    it('should return a single document by id', async () => {
      const documentId = 'doc-123';
      const expectedDocument = {
        id: documentId,
        documentTitle: 'Test Document',
        documentUrl: 'https://example.com/test.pdf',
        userId: 'user-123',
      };

      mockPrismaService.document.findUnique.mockResolvedValue(expectedDocument);

      const result = await service.findOne(documentId);

      expect(mockPrismaService.document.findUnique).toHaveBeenCalledWith({
        where: { id: documentId },
      });
      expect(result).toEqual(expectedDocument);
    });

    it('should return null if document not found', async () => {
      const documentId = 'non-existent';

      mockPrismaService.document.findUnique.mockResolvedValue(null);

      const result = await service.findOne(documentId);

      expect(mockPrismaService.document.findUnique).toHaveBeenCalledWith({
        where: { id: documentId },
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      const documentId = 'doc-123';
      const updateDocumentDto: UpdateDocumentDto = {
        documentTitle: 'Updated Document',
      };
      const expectedDocument = {
        id: documentId,
        documentTitle: 'Updated Document',
        documentUrl: 'https://example.com/test.pdf',
        userId: 'user-123',
      };

      mockPrismaService.document.update.mockResolvedValue(expectedDocument);

      const result = await service.update(documentId, updateDocumentDto);

      expect(mockPrismaService.document.update).toHaveBeenCalledWith({
        where: { id: documentId },
        data: updateDocumentDto,
      });
      expect(result).toEqual(expectedDocument);
    });

    it('should throw an error if document not found', async () => {
      const documentId = 'non-existent';
      const updateDocumentDto: UpdateDocumentDto = {
        documentTitle: 'Updated Document',
      };
      const prismaError = new Error('Document not found');

      mockPrismaService.document.update.mockRejectedValue(prismaError);

      await expect(
        service.update(documentId, updateDocumentDto),
      ).rejects.toThrow(prismaError);
    });
  });

  describe('remove', () => {
    it('should delete a document', async () => {
      const documentId = 'doc-123';
      const deletedDocument = {
        id: documentId,
        documentTitle: 'Test Document',
        documentUrl: 'https://example.com/test.pdf',
        userId: 'user-123',
      };

      mockPrismaService.document.delete.mockResolvedValue(deletedDocument);

      const result = await service.remove(documentId);

      expect(mockPrismaService.document.delete).toHaveBeenCalledWith({
        where: { id: documentId },
      });
      expect(result).toEqual(deletedDocument);
    });

    it('should throw an error if document not found', async () => {
      const documentId = 'non-existent';
      const prismaError = new Error('Document not found');

      mockPrismaService.document.delete.mockRejectedValue(prismaError);

      await expect(service.remove(documentId)).rejects.toThrow(prismaError);
    });
  });
});
