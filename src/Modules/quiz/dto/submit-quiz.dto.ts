import { IsArray, IsMongoId, IsString } from 'class-validator';

export class SubmitQuizDto {
  @IsArray()
  answers: { questionIndex: number; chosen: string }[];
}
