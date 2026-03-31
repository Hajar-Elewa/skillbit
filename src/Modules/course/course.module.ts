import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseController, EnrollController } from './course.controller';
import { CourseService } from './course.service';
import { Course, CourseSchema } from 'src/Models/Cousrses/course.schema';
import { CourseRepo } from 'src/Models/Cousrses/course.repo';
import { Level, LevelSchema } from 'src/Models/Levels/level.schema';
import { LevelRepo } from 'src/Models/Levels/level.repo';
import { Lesson, LessonSchema } from 'src/Models/Lessons/lesson.schem';
import { LessonRepo } from 'src/Models/Lessons/lesson.repo';
import { Enrollment, EnrollmentSchema } from 'src/Models/Enrollments/enrollment.schema';
import { EnrollmentRepo } from 'src/Models/Enrollments/enrollment.repo';
import { User, UserSchema } from 'src/Models/User/user.schema';
import { UserRepo } from 'src/Models/User/user.repo';
import { TokenService } from 'src/common/services/token.service';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name,      schema: CourseSchema },
      { name: Level.name,       schema: LevelSchema },
      { name: Lesson.name,      schema: LessonSchema },
      { name: Enrollment.name,  schema: EnrollmentSchema },
      { name: User.name,        schema: UserSchema },
    ]),
  ],
  controllers: [CourseController, EnrollController],
  providers: [
    CourseService,
    CourseRepo,
    LevelRepo,
    LessonRepo,
    EnrollmentRepo,
    UserRepo,
    TokenService,
    Reflector,
  ],
  exports: [CourseService, CourseRepo],
})
export class CourseModule {}
