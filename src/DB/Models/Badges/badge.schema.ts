import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Badge {
  @Prop({ required: true })
  name: string;           // "Quiz Master"

  @Prop()
  iconUrl: string;        // Cloudinary URL

  @Prop()
  description: string;

  @Prop()
  criteria: string;       // "Complete 5 quizzes"
}

export const BadgeSchema = SchemaFactory.createForClass(Badge)