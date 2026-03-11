import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import   mongoose from 'mongoose';
import { User } from '../User/user.schema';


@Schema()
export class Contest  {

  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, enum: ['global', 'duel'], required: true })
  type: string;

  @Prop({ type: String, required: true })
  level: string;

  @Prop({ type: Date, required: true })
  startTime: Date;

  @Prop({ type: Date, required: true })
  duration: Date;

  @Prop({ type: Date, required: true })
  contestDate: Date;

  @Prop({ type: String, enum: ['upcoming', 'active','finished'], default: 'upcoming' })
  status: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }], default: [] })
  participants: mongoose.Schema.Types.ObjectId[]; // for global contest to add friends who are participating in the contest
  
  // Duel only
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, default: null })
  challengerId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, default: null })
  challengedId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, enum: ['pending', 'accepted', 'rejected'], default: null })
  duelStatus: string;

}

export const ContestSchema = SchemaFactory.createForClass(Contest);