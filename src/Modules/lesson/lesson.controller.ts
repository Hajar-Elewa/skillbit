import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoles } from 'src/common/enums/RolesEnum';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getLessonsByCourse(@Query('course') courseId: string) {
    const lessons = await this.lessonService.getLessonsByCourse(courseId);
    return {message: 'Lessons fetched successfully' , lessons};
  }

  @Auth(UserRoles.Admin)
  @Post()
  async createLesson(@Body() dto: CreateLessonDto) {
  const lesson = await this.lessonService.createLesson(dto);
    return {message: 'Lesson created successfully' , lesson};
  }

  @Auth(UserRoles.Admin)
  @Patch(':id')
  async updateLesson(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    const lesson = await this.lessonService.updateLesson(id, dto);
    return {message: 'Lesson updated successfully' , lesson};
  }

  @Auth(UserRoles.Admin)
  @Delete(':id')
  async deleteLesson(@Param('id') id: string) {
    const lesson =await this.lessonService.deleteLesson(id);
    return {message: 'Lesson deleted successfully' , lesson};
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getLessonWithQuiz(@Param('id') id: string) {
    const { lesson, quiz } = await this.lessonService.getLessonWithQuiz(id);
    return {message: 'Lesson with quiz fetched successfully' , lesson, quiz};
  }
}
