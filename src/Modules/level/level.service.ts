import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { LevelRepo } from 'src/Models/Levels/level.repo';
import { CreateLevelDto, UpdateLevelDto } from './dto';

@Injectable()
export class LevelService {
  constructor(private readonly levelRepo: LevelRepo) {}

//   [
//   {
//     "order": "1",
//     "title": "Fundamentals (Beginner)",
//     "description": "Build core understanding of computers and programming basics for absolute beginners.",
//     "earnScore": "1000"
//   },
//   {
//     "order": "2",
//     "title": "Intermediate",
//     "description": "Introduce problem-solving, structured programming, and system basics.",
//     "earnScore": "2500"
//   },
//   {
//     "order": "3",
//     "title": "Advanced",
//     "description": "Prepare students for real-world CS concepts and advanced problem-solving. Includes high-value rewards and achievements. This level is optional.",
//     "earnScore": "5000"
//   }
//   ]
  async createLevel(dto: CreateLevelDto) {
    // Check if level with same order already exists
    const existingLevel = await this.levelRepo.findOne({ filter: { order: dto.order } });
    if (existingLevel) {
      throw new BadRequestException('A level with this order already exists');
    }

    return this.levelRepo.create(dto);
  }

  async getAllLevels() {
    return this.levelRepo.find({ filter: {}, options: { sort: { order: 1 } } });
  }

  async getLevelById(id: string) {
    const level = await this.levelRepo.findById({ id });
    if (!level) {
      throw new NotFoundException('Level not found');
    }
    return level;
  }

  async getLevelByOrder(order: number) {
    const level = await this.levelRepo.findOne({ filter: { order } });
    if (!level) {
      throw new NotFoundException('Level not found');
    }
    return level;
  }

  async updateLevel(id: string, dto: UpdateLevelDto) {//1
    // If order is being updated, check if it's already taken
    if (dto.order) {//3
      const existingLevel = await this.levelRepo.findOne({
        filter: { order: dto.order, _id: { $ne: id } }// Exclude current level from search [$ne=>notEqual]
      });
      if (existingLevel) {
        throw new BadRequestException('This level already exists!');
      }
    }

    const level = await this.levelRepo.findByIdAndUpdate({id, update: dto });
    if (!level) {
      throw new NotFoundException('Level not found');
    }
    return level;
  }

  async deleteLevel(id: string) {
    const level = await this.levelRepo.findByIdAndDelete({ id });
    if (!level) {
      throw new NotFoundException('Level not found');
    }
    return level;
  }
}
