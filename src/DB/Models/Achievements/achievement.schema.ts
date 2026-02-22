import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


@Schema()
export class Achievement {

  @Prop({ required: true })
  title: string;                    // "Quiz Master"

  @Prop({ required: true })
  description: string;              // "Complete 5 quizzes"

  @Prop({ required: true })
  iconUrl: string;                  // Cloudinary URL

  @Prop({ required: true })
  criteria: string;                 // "complete_5_quizzes" used in service logic
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);