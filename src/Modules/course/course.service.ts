import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CourseRepo } from 'src/Models/Cousrses/course.repo';
import { CourseType } from 'src/Models/Cousrses/course.schema';
import { LevelRepo } from 'src/Models/Levels/level.repo';
import { LessonRepo } from 'src/Models/Lessons/lesson.repo';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UserRepo } from 'src/Models/User/user.repo';
import { EnrollmentRepo } from 'src/Models/Enrollments/enrollment.repo';
import { QuizRepo } from 'src/Models/Quizes/quiz.repo';


@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepo: CourseRepo,
    private readonly levelRepo: LevelRepo,
    private readonly lessonRepo: LessonRepo,
    private readonly userRepo: UserRepo,
    private readonly enrollmentRepo: EnrollmentRepo,
    private readonly quizRepo: QuizRepo,
  ) {}

// TODO: addCourseToFav
// TODO: removeCourseFromFav
// TODO: getFavCourses
// TODO :addRate
// TODO: بعد م يخلص الكورس همسح الانرولمينت بتاعه عشان المساحة
  
  
 async getCoursesByLevel(levelId: string) {
    return this.courseRepo.find( { level:levelId },{},{sort: { order: 1 } });
  }
 
  async createCourse(dto: CreateCourseDto) {
    const level = await this.levelRepo.findById({ id: dto.level });
    if (!level) throw new NotFoundException('Level not found');

    const course = await this.courseRepo.findOne({filter:{$and: [{level: dto.level, title: dto.title}]}}) 
    if (course) throw new BadRequestException('Course already exists');

    if(dto.order === 1 || dto.type === CourseType.OPTIONAL) dto.isLocked = false;    
    else dto.isLocked = true;
     
    return this.courseRepo.create(dto);
  }

  async updateCourse(courseId: string, dto: UpdateCourseDto) {
    const course = await this.courseRepo.findByIdAndUpdate({
      id: courseId,
      update: dto,
      options: { new: true },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

 async deleteCourse(courseId: string) {
  const course = await this.courseRepo.findByIdAndDelete({ id: courseId });
  if (!course) throw new NotFoundException('Course not found');

  //delete all lessons at once — no loop needed
  await this.lessonRepo.deleteMany({ filter: { course: courseId } });

  return true;
  }

  async enrollInCourse(userId: string, courseId: string) {
  const course = await this.courseRepo.findById({ id: courseId });
  if (!course) throw new NotFoundException('Course not found');

  const user = await this.userRepo.findById({ id: userId });
  if (!user) throw new NotFoundException('User not found');

  if (course.order === 1 || course.type === CourseType.OPTIONAL) {
    return this.enrollmentRepo.findOneAndUpdate({
      filter: { userId },
      update: { $push: { enrolledCourses: courseId } },
      options: { new: true },
    });
  }

  const enrollment = await this.enrollmentRepo.findOne({ filter: { user: userId } });
  if (!enrollment) throw new NotFoundException('Enrollment record not found');

  const completedIds = enrollment.completedCourses.map((id) => id.toString());
  const enrolledIds  = enrollment.enrolledCourses.map((id) => id.toString());

  if (completedIds.includes(courseId)) throw new BadRequestException('Course already completed');
  if (enrolledIds.includes(courseId))  throw new BadRequestException('Course already enrolled');

  // Check previous course is completed
  const previousCourse = await this.courseRepo.findOne({
    filter: { level: course.level, order: course.order - 1 },
  });
  if (!previousCourse) throw new NotFoundException('Previous course not found');

  if (!completedIds.includes(previousCourse._id.toString())) {
    throw new BadRequestException('You must complete the previous course first');
  }

  return this.enrollmentRepo.findOneAndUpdate({
    filter: { user: userId },
    update: { $push: { enrolledCourses: courseId } },
    options: { new: true },
  });
  }

 async finishCourse(userId: string, courseId: string) {
  const course = await this.courseRepo.findById({ id: courseId });
  if (!course) throw new NotFoundException('Course not found');

  const enrollment = await this.enrollmentRepo.findOne({ filter: { userId } });
  if (!enrollment) throw new NotFoundException('Enrollment not found');

  const enrolledIds  = enrollment.enrolledCourses.map((id) => id.toString());
  const completedIds = enrollment.completedCourses.map((id) => id.toString());

  if (!enrolledIds.includes(courseId))
    throw new BadRequestException('You are not enrolled in this course');

  if (completedIds.includes(courseId))
    throw new BadRequestException('Course already completed');

  // final quiz = lessonId is null
  const finalQuiz = await this.quizRepo.findOne({
    filter: { courseId, lessonId: null },
  });
  if (!finalQuiz) throw new NotFoundException('Final quiz not found');

 // check from enrollment.completedQuizes directly
  const completedQuizIds = enrollment.completedQuizes.map((id) => id.toString()); //
  
  if (!completedQuizIds.includes(finalQuiz._id.toString()))
    throw new BadRequestException('You must pass the final quiz first');

  return this.enrollmentRepo.findOneAndUpdate({
    filter: { userId },
    update: {
      $pull: { enrolledCourses: courseId },
      $push: { completedCourses: courseId },
    },
    options: { new: true },
  });
 }

}