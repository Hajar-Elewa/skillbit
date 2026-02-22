import { MongooseModule } from "@nestjs/mongoose";
import { Course, CourseSchema } from "./course.schema";

export const CourseModel = MongooseModule.forFeature([
  {
    name: Course.name,
    schema: CourseSchema,
  },
])

// Type
export type TCourse = Course & Document;