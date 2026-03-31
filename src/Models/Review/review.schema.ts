import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Review {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;         

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;       

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating: number;

}

export const ReviewSchema = SchemaFactory.createForClass(Review);