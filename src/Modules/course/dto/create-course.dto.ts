import {IsString, IsNotEmpty, IsNumber, IsBoolean, IsMongoId, IsOptional, Min, Max, IsEnum} from 'class-validator';
import { CourseType } from 'src/Models/Cousrses/course.schema';

export class CreateCourseDto {

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsMongoId()
  level: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  order?: number;

  @IsEnum(CourseType)
  @IsOptional()
  type?: CourseType;

  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @IsBoolean()
  @IsOptional()
  isTutorial?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  earnScore?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  passScore?: number;           // defaults to 70 in schema
}
