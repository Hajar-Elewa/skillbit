import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({ timestamps: true })
export class Quiz {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true })
  courseId: mongoose.Schema.Types.ObjectId;

  //null if final quiz
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null })
  lessonId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, enum: ['easy', 'medium', 'hard'], required: true })
  difficulty: string;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: Number, default: 70 })
  passingScore: number;

  @Prop({ type: Number, default: 0 })
  earnedXp: number;

  @Prop({ type: Number, default: 0 })
  timeLimit: number;

  @Prop({ type: String, default: null })
  title: string; // only for final quiz

  @Prop({
    type: [{
      question:      { type: String, required: true },
      options:       { type: [String], required: true },
      correctAnswer: { type: String, required: true },
    }],
    default: []
  })
  questions: { question: string; options: string[]; correctAnswer: string }[];

}

export const QuizSchema = SchemaFactory.createForClass(Quiz);