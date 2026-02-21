// import {
//   BadRequestException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common'
// import { Types } from 'mongoose'
// import { customAlphabet } from 'nanoid'
// import { OTPTypeEnum } from 'src/DB/Models/otp.model'
// import { otpRepo } from 'src/DB/Repos/otp.repo'
// import { compareHash, createHash } from '../security/hash'

// @Injectable()
// export class OTPService {
//   constructor(private readonly otpRepo: otpRepo) {}

//   async createOTP({
//     type = OTPTypeEnum.VERIFY_EMAIL,
//     userId,
//   }: {
//     type?: OTPTypeEnum
//     userId: Types.ObjectId
//   }) {
//     const nanoid = customAlphabet('0123456789', 6)
//     const otp = nanoid()

//     const isOTPExist = await this.otpRepo.findOne({
//       filter: {
//         userId,
//         type,
//       },
//     })
//     if (isOTPExist && isOTPExist.expireAt > new Date(Date.now())) {
//       //exist but not expired
//       throw new BadRequestException(
//         'OTP already sent, please try after some time',
//       )
//     }

//     if (!isOTPExist) {
//       await this.otpRepo.create({
//         data: {
//           userId,
//           type,
//           expireAt: new Date(Date.now() + 30 * 1000), // 5 minutes
//           otp: await createHash(otp),
//         },
//       })
//       return otp
//     } else {
//       isOTPExist.otp = await createHash(otp)
//       isOTPExist.expireAt = new Date(Date.now() + 30 * 1000) //refresh OTP expiry time
//       return otp
//     }
//   }

//   async validateOtp({
//     otp,
//     userId,
//     type,
//   }: {
//     otp: string
//     userId: Types.ObjectId
//     type: OTPTypeEnum
//   }) {
//     const userOtp = await this.otpRepo.findOne({
//       filter: {
//         userId,
//         type,
//       },
//     })

//     if (!userOtp) {
//       throw new NotFoundException('otp not found')
//     }
//     if (userOtp.expireAt < new Date(Date.now())) {
//       throw new BadRequestException('otp expired')
//     }
//     if (!(await compareHash(otp, userOtp.otp))) {
//       throw new BadRequestException('otp not correct')
//     }
//     await userOtp.deleteOne()
//   }
// }
