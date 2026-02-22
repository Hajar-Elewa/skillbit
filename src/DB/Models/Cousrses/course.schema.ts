import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Course {

  @Prop({ required: true })
  title: string;                    // "Object Oriented Programming"

  @Prop({ required: true })
  description: string;

  @Prop({
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  })
  difficulty: string;               // controls who can access this course

  @Prop({ default: false })
  isTutorial: boolean;              // true = assigned after low assessment score

  @Prop({ default: [] })
  lessons: mongoose.Types.ObjectId[]; // array of lesson IDs

  //Todo: locked && levels
  //T
}

export const CourseSchema = SchemaFactory.createForClass(Course);