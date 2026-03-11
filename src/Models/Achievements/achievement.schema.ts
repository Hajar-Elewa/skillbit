import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Achievement  {

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  iconUrl: string;

  @Prop({ type: Number, required: true })
  xpReward: number;

}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);