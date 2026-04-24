import {IsString, IsNotEmpty, IsNumber, IsBoolean, IsMongoId, IsOptional, Min, Max, IsEnum} from 'class-validator';
import { CourseType } from 'src/Models/Cousrses/course.schema';


export class CreateCourseDto {

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(1)
  level: number;

  @IsNumber()
  @Min(1)
  order: number;

  @IsEnum(CourseType)
  type: CourseType;

  @IsBoolean()
  isLocked: boolean;

  @IsBoolean()
  isTutorial: boolean;

  @IsNumber()
  @Min(0)
  earnScore: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  passScore: number;           // defaults to 70 in schema
}
