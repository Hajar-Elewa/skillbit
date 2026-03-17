import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose  from 'mongoose';
import { User } from '../User/user.schema';
import { Course } from '../Cousrses/course.schema';

@Schema()
export class QuizAttempt  {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  userId: mongoose.Schema.Types.ObjectId;


  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  lessonId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, enum: ['easy', 'medium', 'hard'], required: true })
  difficulty: string;

  @Prop({
    type: [
      {
        question: { type: String, required: true },
        options:  { type: [String], required: true },
        correct:  { type: String, required: true },
        chosen:   { type: String, default: null },
      }
    ],
    default: []
  })
  questions: { question: string; options: string[]; correct: string; chosen: string }[];

  @Prop({ type: Number, default: 0 })
  correctCount: number;

  @Prop({ type: Number, default: 0 })
  score: number; // %

  @Prop({ type: Boolean, default: false })
  passed: boolean;

  @Prop({ type: Number, default: 0 })
  timeTaken: number; // seconds

  @Prop({ type: Number, default: 0 })
  xpEarned: number;

  @Prop({ type: Number, default: 0 })
  xpLost: number;

  @Prop({ type: Date, default: Date.now })
  attemptedAt: Date;
  //default locked

}

export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);