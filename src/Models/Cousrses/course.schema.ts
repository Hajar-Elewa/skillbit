import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';



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
  
}

export const CourseSchema = SchemaFactory.createForClass(Course)