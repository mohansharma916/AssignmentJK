import { IsString } from 'class-validator';

export class sendIngestionDto {
  @IsString()
  message: string;
}
