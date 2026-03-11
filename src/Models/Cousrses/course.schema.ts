import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import  mongoose  from 'mongoose';
import { Lesson } from '../Lessons/lesson.schem';



@Schema()
export class Course  {

  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  level: string;

  @Prop({ type: Boolean, default: false })
  isTutorial: boolean;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: Lesson.name }], default: [] })
  lessons: mongoose.Schema.Types.ObjectId[];

}

export const CourseSchema = SchemaFactory.createForClass(Course)