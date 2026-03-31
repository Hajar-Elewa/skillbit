import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { QuizRepo } from 'src/Models/Quizes/quiz.repo';
import { LessonRepo } from 'src/Models/Lessons/lesson.repo';
import { CourseRepo } from 'src/Models/Cousrses/course.repo';
import { LevelRepo } from 'src/Models/Levels/level.repo';
import { CourseType } from 'src/Models/Cousrses/course.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    private readonly quizRepo: QuizRepo,
    private readonly lessonRepo: LessonRepo,
    private readonly courseRepo: CourseRepo,
    private readonly levelRepo: LevelRepo,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  //  ADMIN – create a quiz for a lesson
  // ─────────────────────────────────────────────────────────────────

  async createQuiz(dto: CreateQuizDto) {
    const lesson = await this.lessonRepo.findById({ id: dto.lessonId });
    if (!lesson) throw new NotFoundException('Lesson not found');

    // Each lesson has at most one quiz definition (per difficulty)
    const existing = await this.quizRepo.findOne({
      filter: {
        lessonId: new Types.ObjectId(dto.lessonId),
        difficulty: dto.difficulty,
      } as any,
    });
    if (existing) throw new BadRequestException('A quiz with this difficulty already exists for this lesson');

    return this.quizRepo.create({
      lessonId: new Types.ObjectId(dto.lessonId) as any,
      difficulty: dto.difficulty as any,
      questions: dto.questions as any,
    });
  }

  /** GET all quizzes for a lesson (to let admin review) */
  getQuizzesByLesson(lessonId: string) {
    return this.quizRepo.find({ lessonId: new Types.ObjectId(lessonId) } as any);
  }

  // ─────────────────────────────────────────────────────────────────
  //  USER – start + submit a quiz attempt
  // ─────────────────────────────────────────────────────────────────

  /**
   * Start a quiz attempt for a lesson — creates a fresh QuizAttempt document
   * with questions copied from the quiz definition (answers hidden from user).
   */
  async startQuiz(userId: string, lessonId: string, difficulty: string) {
    const lesson = await this.lessonRepo.findById({ id: lessonId });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if ((lesson as any).isLocked) throw new ForbiddenException('This lesson is still locked');

    const quizDef = await this.quizRepo.findOne({
      filter: { lessonId: new Types.ObjectId(lessonId), difficulty } as any,
    });
    if (!quizDef) throw new NotFoundException(`No ${difficulty} quiz found for this lesson`);

    // Don't allow re-attempt if already passed
    const alreadyPassed = await this.quizRepo.findOne({
      filter: { userId: new Types.ObjectId(userId), lessonId: new Types.ObjectId(lessonId), passed: true } as any,
    });
    if (alreadyPassed) throw new BadRequestException('You already passed this quiz');

    // Create a fresh attempt (questions without the correct field exposed)
    const questions = (quizDef as any).questions.map((q: any) => ({
      question: q.question,
      options: q.options,
      correct: q.correct,   // stored in DB but API controller should omit from response
      chosen: null,
    }));

    return this.quizRepo.create({
      userId: new Types.ObjectId(userId) as any,
      lessonId: new Types.ObjectId(lessonId) as any,
      difficulty: difficulty as any,
      questions,
    });
  }

  /**
   * Submit answers for an active quiz attempt.
   * Calculates score → if >= lesson.passScore → unlock next lesson/course/level.
   */
  async submitQuiz(userId: string, lessonId: string, dto: SubmitQuizDto) {
    const lesson = await this.lessonRepo.findById({ id: lessonId });
    if (!lesson) throw new NotFoundException('Lesson not found');

    if ((lesson as any).isLocked) throw new ForbiddenException('This lesson is still locked');

    // Find the latest un-passed attempt for this user + lesson
    const attempt = await this.quizRepo.findOne({
      filter: {
        userId: new Types.ObjectId(userId),
        lessonId: new Types.ObjectId(lessonId),
        passed: { $ne: true },
      } as any,
    });
    if (!attempt) throw new NotFoundException('No active quiz attempt found. Please start the quiz first.');

    const questions = (attempt as any).questions as {
      question: string;
      options: string[];
      correct: string;
      chosen: string | null;
    }[];

    // Apply chosen answers
    let correctCount = 0;
    for (const ans of dto.answers) {
      const q = questions[ans.questionIndex];
      if (!q) continue;
      q.chosen = ans.chosen;
      if (q.chosen === q.correct) correctCount++;
    }

    const total = questions.length;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = score >= (lesson as any).passScore;

    await this.quizRepo.findByIdAndUpdate({
      id: (attempt as any)._id,
      update: { questions, correctCount, score, passed },
      options: { new: true },
    });

    if (passed) {
      await this._unlockNext(lesson as any);
    }

    return { score, passed, correctCount, total };
  }

  // ─────────────────────────────────────────────────────────────────
  //  PRIVATE UNLOCK CHAIN
  // ─────────────────────────────────────────────────────────────────

  private async _unlockNext(lesson: any) {
    const courseLessons = await this.lessonRepo.find(
      { course: lesson.course },
      {},
      { sort: { order: 1 } },
    );

    const currentIdx = courseLessons.findIndex(
      (l: any) => l._id.toString() === lesson._id.toString(),
    );

    const nextLesson = courseLessons[currentIdx + 1];

    if (nextLesson) {
      await this.lessonRepo.findByIdAndUpdate({
        id: (nextLesson as any)._id,
        update: { isLocked: false },
      });
      return;
    }

    // Last lesson in the course → unlock next mandatory course
    await this._unlockNextCourse(lesson.course.toString());
  }

  private async _unlockNextCourse(courseId: string) {
    const course = await this.courseRepo.findById({ id: courseId });
    if (!course) return;

    const mandatoryCourses = await this.courseRepo.find(
      { level: (course as any).level, type: CourseType.MANDATORY },
      {},
      { sort: { order: 1 } },
    );

    const currentIdx = mandatoryCourses.findIndex(
      (c: any) => c._id.toString() === courseId,
    );

    const nextCourse = mandatoryCourses[currentIdx + 1];

    if (nextCourse) {
      await this.courseRepo.findByIdAndUpdate({
        id: (nextCourse as any)._id,
        update: { isLocked: false },
      });
      // Unlock its first lesson
      const firstLesson = await this.lessonRepo.findOne({
        filter: { course: (nextCourse as any)._id },
        options: { sort: { order: 1 } } as any,
      });
      if (firstLesson) {
        await this.lessonRepo.findByIdAndUpdate({
          id: (firstLesson as any)._id,
          update: { isLocked: false },
        });
      }
      return;
    }

    // Last mandatory course in level → unlock next level
    await this._unlockNextLevel((course as any).level.toString());
  }

  private async _unlockNextLevel(levelId: string) {
    const level = await this.levelRepo.findById({ id: levelId });
    if (!level) return;

    // Next still-locked level (insert-order approximation via _id)
    const nextLevels = await this.levelRepo.find(
      { isLocked: true, _id: { $gt: (level as any)._id } },
      {},
      { sort: { _id: 1 }, limit: 1 } as any,
    );

    const nextLevel = nextLevels[0];
    if (!nextLevel) return;

    await this.levelRepo.findByIdAndUpdate({
      id: (nextLevel as any)._id,
      update: { isLocked: false },
    });

    // Unlock the first mandatory course of that level
    const firstCourse = await this.courseRepo.findOne({
      filter: { level: (nextLevel as any)._id, type: CourseType.MANDATORY },
      options: { sort: { order: 1 } } as any,
    });
    if (firstCourse) {
      await this.courseRepo.findByIdAndUpdate({
        id: (firstCourse as any)._id,
        update: { isLocked: false },
      });
      // Unlock its first lesson
      const firstLesson = await this.lessonRepo.findOne({
        filter: { course: (firstCourse as any)._id },
        options: { sort: { order: 1 } } as any,
      });
      if (firstLesson) {
        await this.lessonRepo.findByIdAndUpdate({
          id: (firstLesson as any)._id,
          update: { isLocked: false },
        });
      }
    }
  }
}
