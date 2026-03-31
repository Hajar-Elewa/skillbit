import { IsString, IsNotEmpty, IsNumber, IsMongoId, IsOptional, Min, Max, IsArray } from 'class-validator';

export class CreateQuizDto {
  @IsMongoId()
  lessonId: string;

  @IsString()
  @IsNotEmpty()
  difficulty: 'easy' | 'medium' | 'hard';

  @IsArray()
  questions: {
    question: string;
    options: string[];
    correct: string;
  }[];
}
