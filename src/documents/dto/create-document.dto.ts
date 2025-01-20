import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  documentTitle: string;

  @IsString()
  @IsNotEmpty()
  documentUrl?: string;
}
