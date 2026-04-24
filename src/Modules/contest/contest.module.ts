import { Module } from '@nestjs/common';
import { ContestService } from './contest.service';
import { ContestController } from './contest.controller';
import { AuthController } from '../Auth/auth.controller';
import { AuthService } from '../Auth/auth.service';
import { UserRepo } from 'src/Models/User/user.repo';
import { ContestResultRepo } from 'src/Models/Contests/cotest.result.repo';
import { DuelRequestRepo } from 'src/Models/Contests/duel.request.repo';
import { ContestRepo } from 'src/Models/Contests/contest.repo';
import { TokenService } from 'src/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/Models/User/user.schema';
import { Contest, ContestSchema } from 'src/Models/Contests/cotest.schema';
import { ContestResult, ContestResultSchema } from 'src/Models/Contests/contest.result.schema';
import { DuelRequest, DuelRequestSchema } from 'src/Models/Contests/duel.request.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load .env file and make it available globally
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Contest.name, schema: ContestSchema },
      { name: ContestResult.name, schema: ContestResultSchema },
      { name: DuelRequest.name, schema: DuelRequestSchema },
    ]),
  ],
  controllers: [ContestController,AuthController],
  providers: [ContestService,AuthService,ContestRepo,UserRepo,ContestResultRepo,DuelRequestRepo,TokenService,JwtService],
})
export class ContestModule {}
