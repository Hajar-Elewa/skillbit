import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoles } from 'src/common/enums/RolesEnum';
import { AuthGuard } from 'src/common/guards/auth.guard';
import type { AuthReq } from 'src/common/AuthReq';


@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @UseGuards(AuthGuard)
  @Get()
  getCoursesByLevel(@Query('level') levelId: string) {
    const courses = this.courseService.getCoursesByLevel(levelId);
    return {message: "Courses fetched successfully", courses}
  }

  @Auth(UserRoles.Admin)
  @Post()
  createCourse(@Body() dto: CreateCourseDto) {
    const course = this.courseService.createCourse(dto);
    return {message: "Course created successfully", course}
  }

  @Auth(UserRoles.Admin)
  @Patch(':id')
  updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    const course = this.courseService.updateCourse(id, dto);
    return {message: "Course updated successfully", course}
  }

  @Auth(UserRoles.Admin)
  @Delete(':id')
  deleteCourse(@Param('id') id: string) {
    const course = this.courseService.deleteCourse(id);
    return {message: "Course deleted successfully", course}
  }

  @UseGuards(AuthGuard)
  @Post(':id/enroll')
  enrollInCourse(@Req() req: AuthReq, @Param('id') courseId: string) {
    const course = this.courseService.enrollInCourse(req.user.id, courseId);
    return {message: "Course enrolled successfully", course}
  }

  @UseGuards(AuthGuard)
  @Post(':id/complete')
  completeCourse(@Req() req: AuthReq, @Param('id') courseId: string) {
    const course = this.courseService.completeCourse(req.user.id, courseId);
    return {message: "Course completed successfully", course}
  }
}
