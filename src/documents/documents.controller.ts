import {
  Controller,
  Get,
  Post,
  Param,
  Headers,
  Delete,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  UseGuards,
  Body,
  Patch,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { RolesGuard } from 'src/auth/role.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { UserEntity } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('document', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const fileExtension = file.mimetype.split('/')[1];

          cb(null, `${Date.now()}.${fileExtension}`);
        },
      }),
      limits: { fileSize: 1024 * 1024 * 2 }, // 2MB file size limit
    }),
  )
  async uploadSingle(@UploadedFile() file, @Headers() header) {
    const origin = header.host;
    console.log(file);

    return await this.documentsService.getUploadResponse(file, origin);
  }

  @Get(':name')
  getFile(@Param() params): StreamableFile {
    const file = createReadStream(
      join(process.cwd(), `uploads/${params.name}`),
    );
    return new StreamableFile(file);
  }

  @Post()
  createDocument(
    @UserEntity()
    user: User,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    return this.documentsService.createDocument(createDocumentDto, user.id);
  }

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
// function diskStorage(arg0: { destination: string; filename: any }): any {
//   throw new Error('Function not implemented.');
// }
