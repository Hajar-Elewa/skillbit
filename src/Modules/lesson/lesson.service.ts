import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { LessonRepo } from 'src/Models/Lessons/lesson.repo';
import { CourseRepo } from 'src/Models/Cousrses/course.repo';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { QuizRepo } from 'src/Models/Quizes/quiz.repo';

@Injectable()
export class LessonService {
  constructor(
    private readonly lessonRepo: LessonRepo,
    private readonly courseRepo: CourseRepo,
    private readonly quizRepo: QuizRepo
    
  ) {}

  async getLessonsByCourse(courseId: string) {
    return this.lessonRepo.find(
      { course: new Types.ObjectId(courseId) },
      {},
      { sort: { order: 1 } },
    );
  }

  async createLesson(dto: CreateLessonDto) {
  const course = await this.courseRepo.findById({ id: dto.course });
  if (!course) throw new NotFoundException('Course not found');

  const titleTaken = await this.lessonRepo.findOne({
    filter: { course: new Types.ObjectId(dto.course), title: dto.title },
  });
  if (titleTaken)
    throw new BadRequestException('A lesson with this title already exists in this course');

  const orderTaken = await this.lessonRepo.findOne({
    filter: { course: new Types.ObjectId(dto.course), order: dto.order },
  });
  if (orderTaken)
    throw new BadRequestException(`A lesson with order ${dto.order} already exists in this course`);

  const isLocked = dto.order !== 1;
  const lesson = await this.lessonRepo.create({ ...dto, isLocked });
  return lesson;
  }

  async updateLesson(lessonId: string, dto: UpdateLessonDto) {
    const lesson = await this.lessonRepo.findByIdAndUpdate({
      id: lessonId,
      update: dto,
      options: { new: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async deleteLesson(lessonId: string) {
  const lesson = await this.lessonRepo.findByIdAndDelete({ id: lessonId });
  if (!lesson) throw new NotFoundException('Lesson not found');

  // Shift all lessons after the deleted one down by 1
  await this.lessonRepo.Update({
    filter: { course: lesson.course, order: { $gt: lesson.order } },
    update: { $inc: { order: -1 } },//decrement order of lessons after the deleted one
  });

  return lesson;
  }

  async getLessonWithQuiz(lessonId: string) {
    const lesson = await this.lessonRepo.findById({ id: lessonId });
    if (!lesson) throw new NotFoundException('Lesson not found');

     if (lesson.isLocked) {
      throw new ForbiddenException('You can not access this lesson');
    }
    
    const quiz = await this.quizRepo.findOne({ filter: { lesson: lessonId } });
    if (!quiz) throw new NotFoundException('Quiz of the lesson not found');

    return {lesson, quiz};
  }
}