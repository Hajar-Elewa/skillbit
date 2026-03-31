import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoles } from 'src/common/enums/RolesEnum';
import { AuthGuard } from 'src/common/guards/auth.guard';
import type { AuthReq } from 'src/common/AuthReq';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  /** GET /quiz?lesson=<lessonId>  → view quizzes for a lesson */
  @UseGuards(AuthGuard)
  @Get()
  getQuizzesByLesson(@Query('lesson') lessonId: string) {
    return this.quizService.getQuizzesByLesson(lessonId);
  }

  /**
   * POST /quiz  → admin only
   * Creates a quiz definition (questions + correct answers) for a lesson.
   */
  @Auth(UserRoles.Admin)
  @Post()
  createQuiz(@Body() dto: CreateQuizDto) {
    return this.quizService.createQuiz(dto);
  }

  /**
   * POST /quiz/:lessonId/start?difficulty=easy
   * User starts a fresh quiz attempt for a lesson.
   */
  @UseGuards(AuthGuard)
  @Post(':lessonId/start')
  startQuiz(
    @Param('lessonId') lessonId: string,
    @Query('difficulty') difficulty: string,
    @Req() req: AuthReq,
  ) {
    return this.quizService.startQuiz(
      (req.user as any)._id.toString(),
      lessonId,
      difficulty || 'easy',
    );
  }

  /**
   * POST /quiz/:lessonId/submit
   * User submits answers; score is calculated and next item unlocked if passed.
   */
  @UseGuards(AuthGuard)
  @Post(':lessonId/submit')
  submitQuiz(
    @Param('lessonId') lessonId: string,
    @Body() dto: SubmitQuizDto,
    @Req() req: AuthReq,
  ) {
    return this.quizService.submitQuiz(
      (req.user as any)._id.toString(),
      lessonId,
      dto,
    );
  }
}
