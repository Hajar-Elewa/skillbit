import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateContestDto } from './dto/create-contest.dto';
import { ContestRepo } from 'src/Models/Contests/contest.repo';
import { UserRepo } from 'src/Models/User/user.repo';
import { ContestResultRepo } from 'src/Models/Contests/cotest.result.repo';
import { calculateQuestionScore, leaderboardModifiers } from 'src/common/utils/score-calculator';
import { DuelRequestRepo } from 'src/Models/Contests/duel.request.repo';
import { sendEmail } from 'src/common';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class ContestService {
  constructor(
    private readonly contestRepo: ContestRepo,
    private readonly userRepo: UserRepo,
    private readonly contestResultRepo: ContestResultRepo,
    private readonly duelRequestRepo: DuelRequestRepo,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) { }

  async createContest(dto: CreateContestDto) {
    // delete old finished contests for same level and type
    await this.contestRepo.deleteOne({
      filter: {
        level: dto.level,
        type: dto.type,
        status: 'finished'
      }
    })

    // 1. check time overlap
    const existingContest = await this.contestRepo.findOne({
      filter: {
        level: dto.level,
        type: dto.type,
        startTime: {
          $gte: dto.startTime,
          $lt: new Date(new Date(dto.startTime).getTime() + dto.duration * 60 * 1000)
        }
      }
    })
    if (existingContest)
      throw new ConflictException('A contest already exists at this time')

    // 2. create contest
    const contest = await this.contestRepo.create({
      ...dto,
      status: 'upcoming',
    })

    return contest
  }

  async joinContest(user: any, contestId: string) {
    // 1. check contest exists
    const contest = await this.contestRepo.findById({ id: contestId })
    if (!contest) {
      throw new NotFoundException('Contest not found')
    }

    // 2. check contest is not finished
    if (contest.status === 'finished') {
      throw new BadRequestException('Contest is already finished')
    }

    // 3. check user level matches contest level
    if (user.level.toString() !== contest.level.toString()) {
      throw new ForbiddenException('You are not eligible for this contest')
    }

    // 4. check if user already joined
    const alreadyJoined = contest.participants
      .some(id => id.toString() === user._id.toString())
    if (alreadyJoined) {
      throw new BadRequestException('You already joined this contest')
    }

    // 5. add user to participants
    await this.contestRepo.findByIdAndUpdate({
      id: contestId,
      update: { $push: { participants: user._id } }
    })

    // send email to participant
    await sendEmail({
      to: user.email,
      subject: '🏆 Contest Registration Confirmed!',
      html: `<h1>Hello ${user.fullname}!</h1>
         <p>You have successfully joined: <strong>${contest.title}</strong></p>
         <p>Starts at: <strong>${contest.startTime}</strong></p>`
    })

    // schedule reminder 15 min before
    const reminderTime = new Date(contest.startTime.getTime() - 15 * 60 * 1000)

    const job = new CronJob(reminderTime, async () => {
      await sendEmail({
        to: user.email,
        subject: '⏰ Contest Starting in 15 Minutes!',
        html: `<h1>Hello ${user.fullname}!</h1>
               <p><strong>${contest.title}</strong> starts in 15 minutes! 💪</p>`
      })
    })
    this.schedulerRegistry.addCronJob(`reminder-${contestId}-${user._id}`, job)
    job.start()

    return true
  }

  async submitContest(user: any, contestId: string, answers: number[], timeTaken: number) {
    const contest = await this.contestRepo.findById({ id: contestId })
    if (!contest) throw new NotFoundException('Contest not found')

    if (contest.status !== 'active')
      throw new BadRequestException('Contest is not active')

    const isParticipant = contest.participants
      .some(id => id.toString() === user._id.toString())
    if (!isParticipant)
      throw new ForbiddenException('You are not a participant in this contest')

    const existingResult = await this.contestResultRepo.findOne({
      filter: { contestId, userId: user._id }
    })
    if (existingResult)
      throw new BadRequestException('You already submitted this contest')

    let totalScore = 0
    let totalLost = 0
    let correctCount = 0

    contest.questions.forEach((q, index) => {
      if (answers[index] === -1 || answers[index] === undefined) return

      const isCorrect = q.correctAnswerIndex === answers[index]
      if (isCorrect) correctCount++

      const { gained, lost } = calculateQuestionScore(
        contest.questionScore,
        user.level,
        user.rank,
        contest.difficulty,
        isCorrect,
        undefined
      )
      totalScore += gained
      totalLost += lost
    })

    await this.contestResultRepo.create({
      contestId,
      userId: user._id,
      answers,
      correctCount,
      score: totalScore,
      timeTaken,
      xpEarned: totalScore,
      xpLost: totalLost
    })

    await this.userRepo.findByIdAndUpdate({
      id: user._id,
      update: { $inc: { score: totalScore - totalLost } }
    })

    return {
      correctCount,
      totalQuestions: contest.questions.length,
      score: totalScore,
      lost: totalLost,
      timeTaken
    }
  }

  async getContestResults(userId: string, contestId: string) {
    const contest = await this.contestRepo.findById({ id: contestId })
    if (!contest) throw new NotFoundException('Contest not found')

    const allResults = await this.contestResultRepo.find(
      { contestId: contestId as any },
      {},
      { sort: { score: -1, timeTaken: 1 } }
    )

    const myResult = await this.contestResultRepo.findOne({
      filter: { contestId, userId }
    })

    // duel → winner/loser only
    if (contest.type === 'duel') {
      if (allResults.length < 2)
        throw new BadRequestException('Both users must submit first')

      const winner = allResults[0]
      const loser = allResults[1]

      return {
        type: 'duel',
        winner: winner.userId,
        loser: loser.userId,
        myResult,
        results: allResults
      }
    }

    // global → top 3 + leaderboard bonus
    const top3 = allResults.slice(0, 3).map((result, index) => {
      const position = index + 1
      const bonus = leaderboardModifiers[position] || 1
      return {
        userId: result.userId,
        score: Math.floor(result.score * bonus),
        rank: position,
        timeTaken: result.timeTaken
      }
    })

    const userRank = allResults
      .findIndex(r => r.userId.toString() === userId.toString()) + 1

    return {
      type: 'global',
      myResult,
      userRank,
      top3
    }
  }

  async getContestAnswers(userId: string, contestId: string) {
    const contest = await this.contestRepo.findById({ id: contestId })
    if (!contest) throw new NotFoundException('Contest not found')

    const result = await this.contestResultRepo.findOne({
      filter: { contestId, userId }
    })
    if (!result) throw new NotFoundException('Result not found, you may not have submitted this contest')

    const questionsWithAnswers = contest.questions.map((q, index) => ({
      question: q.question,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      chosenAnswerIndex: result.answers[index],
      isCorrect: result.answers[index] === q.correctAnswerIndex,
      isSkipped: result.answers[index] === -1
    }))

    return { score: result.score, correctCount: result.correctCount, questionsWithAnswers }
  }

  //Duel Contest

  async sendDuelRequest(user: any, challengedId: string) {
    // 1. can't duel yourself
    if (user._id.toString() === challengedId.toString())
      throw new BadRequestException('You cannot duel yourself')

    // 2. check challenged user exists
    const challengedUser = await this.userRepo.findById({ id: challengedId })
    if (!challengedUser) throw new NotFoundException('User not found')

    // 3. check they are friends
    const isFriend = user.friends
      .some((id: any) => id.toString() === challengedId.toString())
    if (!isFriend) throw new BadRequestException('You can only duel friends')

    // 4. check no pending duel request between them
    const existingRequest = await this.duelRequestRepo.findOne({
      filter: {
        status: 'pending',
        $or: [
          { challengerId: user._id, challengedId: challengedId },
          { challengerId: challengedId, challengedId: user._id }
        ]
      }
    })
    if (existingRequest) throw new BadRequestException('A duel request already exists')

    // 5. create duel request
    const duelRequest = await this.duelRequestRepo.create({
      challengerId: user._id,
      challengedId: challengedId
    })

    return duelRequest
  }

  async acceptDuelRequest(user: any, duelRequestId: string) {
    // 1. find duel request
    const duelRequest = await this.duelRequestRepo.findById({ id: duelRequestId })
    if (!duelRequest) throw new NotFoundException('Duel request not found')

    // 2. check user is the challenged one
    if (duelRequest.challengedId.toString() !== user._id.toString())
      throw new ForbiddenException('You are not the challenged user')

    // 3. check request is pending
    if (duelRequest.status !== 'pending')
      throw new BadRequestException('Duel request is no longer pending')

    // 4. update request status only
    await this.duelRequestRepo.findByIdAndUpdate({
      id: duelRequestId,
      update: { status: 'accepted' }
    })

    const contest = await this.contestRepo.findById({ id: duelRequest.contestId })
    if (!contest) throw new NotFoundException('Contest not found') // ✅ handle null

    // get challenger and challenged users
    const challenger = await this.userRepo.findById({ id: duelRequest.challengerId })
    const challenged = await this.userRepo.findById({ id: duelRequest.challengedId })


    // send to challenger
    await sendEmail({
      to: challenger?.email as string,
      subject: '⚔️ Your Duel is Starting!',
      html: `
        <h1>Hello ${challenger?.fullname}!</h1>
        <p>Your duel against <strong>${challenged?.fullname}</strong> starts on: <strong>${contest?.startTime}</strong></p>
        <p>Good luck! ⚔️</p>
      `
    })

    // send to challenged
    await sendEmail({
      to: challenged?.email as string,
      subject: '⚔️ You Have Been Challenged!',
      html: `
        <h1>Hello ${challenged?.fullname}!</h1>
        <p>You are being challenged by <strong>${challenger?.fullname}</strong> on: <strong>${contest?.startTime}</strong></p>
        <p>Good luck! ⚔️</p>
      `
    })


    //sending reminder emails to participants 15 minutes before the contest starts
    const reminderTime = new Date(contest.startTime.getTime() - 15 * 60 * 1000)

    const job = new CronJob(reminderTime, async () => {
      // send to challenger
      await sendEmail({
        to: challenger?.email as string,
        subject: '⚔️ Your Duel is Starting!',
        html: `
        <h1>Hello ${challenger?.fullname}!</h1>
        <p>Your duel against <strong>${challenged?.fullname}</strong> starts in 15 minutes! 💪</p>
        <p>Good luck! ⚔️</p>
      `
      })

      // send to challenged
      await sendEmail({
        to: challenged?.email as string,
        subject: '⚔️ You Have Been Challenged!',
        html: `
        <h1>Hello ${challenged?.fullname}!</h1>
        <p>Your duel against <strong>${challenger?.fullname}</strong> starts in 15 minutes! 💪</p>
        <p>Good luck! ⚔️</p>
      `
      })
    })

    this.schedulerRegistry.addCronJob(`reminder-${contest['_id']}`, job)
    job.start()

    return true
  }

  async rejectDuelRequest(user: any, duelRequestId: string) {
    // 1. find duel request
    const duelRequest = await this.duelRequestRepo.findById({ id: duelRequestId })
    if (!duelRequest) throw new NotFoundException('Duel request not found')

    // 2. check user is the challenged one
    if (duelRequest.challengedId.toString() !== user._id.toString())
      throw new ForbiddenException('You are not the challenged user')

    // 3. check request is pending
    if (duelRequest.status !== 'pending')
      throw new BadRequestException('Duel request is no longer pending')

    // 4. update request status only
    await this.duelRequestRepo.findByIdAndUpdate({
      id: duelRequestId,
      update: { status: 'rejected' }
    })
    //delete from duel request
    await this.duelRequestRepo.deleteOne({ filter: { _id: duelRequestId } })
    return true
  }
}