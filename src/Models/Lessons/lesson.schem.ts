import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose  from 'mongoose';



@Schema()
export class Lesson  {

  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({type: String, required: true, default: [] })
  materials: string[];

  @Prop({ type: Number, required: true })
  order: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true })
  courseId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isLocked: boolean;

}

export const LessonSchema = SchemaFactory.createForClass(Lesson);