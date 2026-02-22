import { MongooseModule } from "@nestjs/mongoose";
import { Achievement, AchievementSchema } from "./achievement.schema";

// Model
export const AchievementModel = MongooseModule.forFeature([
  {
    name: Achievement.name,
    schema: AchievementSchema,
  },
])

// Type
export type TAchievement = Achievement & Document;