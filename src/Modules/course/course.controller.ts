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
  async getCoursesByLevel(@Query('level') levelId: string) {
    const courses =await this.courseService.getCoursesByLevel(levelId);
    return {message: "Courses fetched successfully", courses}
  }

  @Auth(UserRoles.Admin)
  @Post()
  async createCourse(@Body() dto: CreateCourseDto) {
    const course =await this.courseService.createCourse(dto);
    return {message: "Course created successfully", course}
  }

  @Auth(UserRoles.Admin)
  @Patch(':id')
  async updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    const course =await this.courseService.updateCourse(id, dto);
    return {message: "Course updated successfully", course}
  }

  @Auth(UserRoles.Admin)
  @Delete(':id')
  async deleteCourse(@Param('id') id: string) {
    await this.courseService.deleteCourse(id)
    return {message: "Course deleted successfully"}
  }

  @UseGuards(AuthGuard)
  @Post(':id/enroll')
  async enrollInCourse(@Req() req: AuthReq, @Param('id') courseId: string) {
    const course =await this.courseService.enrollInCourse(req.user.id, courseId);
    return {message: "Course enrolled successfully", course}
  }

  @UseGuards(AuthGuard)
  @Post(':id/complete')
  async completeCourse(@Req() req: AuthReq, @Param('id') courseId: string) {
    const course =await this.courseService.finishCourse(req.user.id, courseId);
    return {message: "Course completed successfully", course}
  }
}
