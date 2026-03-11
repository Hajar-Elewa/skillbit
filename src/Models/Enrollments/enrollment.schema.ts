import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import   mongoose  from 'mongoose';


@Schema()
export class Enrollment  {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }], default: [] })
  completedQuizes: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], default: [] })
  completedCourses: mongoose.Schema.Types.ObjectId[];

}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);