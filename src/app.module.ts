import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './Modules/Auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './Modules/User/user.module';
import devConfig from './config/env/dev.config';
import { User, UserSchema } from './Models/User/user.schema';
import { Admin, AdminSchema } from './Models/Admin/admin.sachema';
import { CourseModule } from './Modules/course/course.module';
import { LessonModule } from './Modules/lesson/lesson.module';
import { QuizModule } from './Modules/quiz/quiz.module';
import { ContestModule } from './Modules/contest/contest.module';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [
    ScheduleModule.forRoot(),//for scheduling cron jobs
    ConfigModule.forRoot({//for loading environment variables
          load: [devConfig],
          isGlobal:true
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('DATABASE_URL'),
      }),
    }),
    MongooseModule.forFeature([
   {
    name: User.name,
    schema: UserSchema,
    discriminators: [
      {
        name: Admin.name,
        schema: AdminSchema,
      }
    ],
   }
    ]),
     AuthModule,
     UserModule,
     CourseModule,
     LessonModule,
     QuizModule,
     ContestModule,
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

