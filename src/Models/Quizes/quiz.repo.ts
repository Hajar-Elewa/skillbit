import { Injectable } from '@nestjs/common';
import { DBService } from '../abstract.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizAttempt } from './QuizAttempt';

@Injectable()
export class QuizRepo extends DBService<QuizAttempt> {
  constructor(
    @InjectModel(QuizAttempt.name) private quizModel: Model<QuizAttempt>,
  ) {
    super(quizModel);
  }
}
