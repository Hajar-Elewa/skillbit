import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../User/user.schema';
import { Course } from '../Cousrses/course.schema';

@Schema({ timestamps: true })
export class QuizAttempt {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true })
  quizId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Course.name, required: true })
  courseId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true })
  lessonId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [String], default: [] })
  answers: string[]; // answers[0] = chosen answer for questions[0]

  @Prop({ type: Number, default: 0 })
  correctCount: number;

  @Prop({ type: Number, default: 0 })
  score: number; // calculated in service

  @Prop({ type: Boolean, default: false })
  passed: boolean;

  @Prop({ type: Number, default: 0 })
  timeTaken: number;

  @Prop({ type: Number, default: 0 })
  xpEarned: number;

  @Prop({ type: Number, default: 0 })
  xpLost: number;

}

export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);