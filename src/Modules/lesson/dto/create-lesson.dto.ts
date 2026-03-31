import { IsString, IsNotEmpty, IsNumber, IsMongoId, IsOptional, Min, Max, IsArray } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsMongoId()
  course: string;

  @IsNumber()
  @Min(1)
  order: number;

  @IsArray()
  @IsOptional()
  materials?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  passScore?: number;           
}