import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  getUploadResponse(file: any, origin: string) {
    const url = `https://${origin}/documents/${file.filename}`;
    return {
      originalname: file.originalname,
      filename: file.filename,
      url,
    };
  }

  async createDocument(createDocumentDto: CreateDocumentDto, userId: string) {
    const documentCreated = await this.prisma.document.create({
      data: {
        documentTitle: createDocumentDto.documentTitle,
        documentUrl: createDocumentDto.documentUrl,
        userId,
      },
    });
    return documentCreated;
  }

  async findAll() {
    return await this.prisma.document.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.document.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto) {
    return await this.prisma.document.update({
      where: {
        id,
      },
      data: {
        ...updateDocumentDto,
      },
    });
  }

  async remove(id: string) {
    return await this.prisma.document.delete({
      where: {
        id,
      },
    });
  }
}
