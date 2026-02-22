import { MongooseModule } from "@nestjs/mongoose";
import { Lesson, LessonSchema } from "./lesson.schem";

// Model
export const LessonModel = MongooseModule.forFeature([
  {
    name: Lesson.name,
    schema: LessonSchema,
  },
])

// Type
export type TLesson = Lesson & Document;