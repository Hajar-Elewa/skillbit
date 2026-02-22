import { MongooseModule } from "@nestjs/mongoose";
import { Progress, ProgressSchema } from "./progress.schema";

// Model
export const ProgressModel = MongooseModule.forFeature([
  {
    name: Progress.name,
    schema: ProgressSchema,
  },
])

// Type
export type TProgress = Progress & Document;