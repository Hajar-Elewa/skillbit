import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Badge {

  @Prop({ required: true })
  name: string;           // "Quiz Master"

   @Prop()
  description: string;

  @Prop()
  iconUrl: string;        // Cloudinary URL

  @Prop()
  criteria: string;       // "Complete 5 quizzes"
}

export const BadgeSchema = SchemaFactory.createForClass(Badge)