import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { compare, generateOTP, Hash, sendEmail, TokenService } from 'src/common';
import { UserRepo } from "src/DB/Models/User/user.repo";
import { loginDto, signUpDto } from "./dto";
import 'dotenv/config';

@Injectable()
export class AuthService {
constructor(
    private readonly userRepo:UserRepo,
    private readonly tokenService:TokenService

) {}

//with google and github we will skip email verification and directly set isVerified to true
    async signUp( signUpDto:signUpDto) {
     const {fullname,email,password,role,level} = signUpDto
     const user = await this.userRepo.findByEmail(email)
      if(user) {
            throw new ConflictException('User already exists')
        } 
        const otp = generateOTP(6)

       const createdUser = await this.userRepo.create({
            fullname,
            email,
            password: await Hash(password),
            role,
            level,
            emailOtp: {
                code: otp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000) // OTP expires in 10 minutes
            }
        })

      await sendEmail({
            to: email,
            from:process.env.EMAIL,
            subject: 'confirmation email',
            html: `<h1>Welcome ${fullname}</h1><p>Thank you for signing up. Please confirm your email address useing this OTP: ${otp}</p>`
        })
          
       return {
     message: 'Account created successfully, please check your email for OTP',
     fullname: createdUser.fullname,
     email: createdUser.email
        }
}

    async confirmEmail(email:string,otp:string) {
        const user = await this.userRepo.findByEmail(email)

        if(!user) {
            throw new NotFoundException('User not found')
        }

        if(!user.emailOtp || user.emailOtp.expiresAt < new Date() || user.emailOtp.code !== otp) { 
            throw new BadRequestException('OTP expired, request a new one')
        }

        await this.userRepo.update({email},
            { 
          $unset: {
          emailOtp: ""
        },
         isVerified: true
       })
   
  return true
}

    async resendOtp(email: string) {
         const user = await this.userRepo.findByEmail(email)
             if(!user) {
               throw new NotFoundException('User not found')
             }

             if(user.isVerified) {
                throw new BadRequestException('Email already verified')
             }

  
             const otp = generateOTP(6)

             await this.userRepo.update(
                  { email },
                  {
                    emailOtp: {
                    code: otp,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // fresh 10 minutes
                }
    }
  )

      await sendEmail({
          to: email,
          from: process.env.EMAIL,
          subject: 'New OTP Request',
           html: `<h1>Hello ${user.fullname}</h1>
                  <p>Your new OTP is: <strong>${otp}</strong></p>
                  <p>This OTP will expire in 10 minutes.</p>`
  })

  return true
}

    async login(loginDto:loginDto) {
        const {email,password} = loginDto
        const user = await this.userRepo.findByEmail(email)
        if(!user) {
            throw new UnauthorizedException('Invalid credentials')
        } 

        if(!user.isVerified) {
          throw new UnauthorizedException('Please confirm your email first')
        } 

        if(! await compare(password,user.password)) {
            throw new UnauthorizedException('Invalid credentials')
        }

        const accessToken = this.tokenService.sign(
            { _id: user['_id'], email: user.email },
            { secret: process.env.JWT_SECRET, expiresIn: '1h' }
        )

        const refreshToken = this.tokenService.sign(
            { _id: user['_id'], email: user.email },
            { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' }
        )
        
             return {
                accessToken,
                refreshToken,
            }
}

    async refresh(refreshToken: string) {

  // 1. verify the refreshToken
  const payload = this.tokenService.verify(
    {
    refreshToken,
     secret: process.env.JWT_REFRESH_SECRET }
  )

  if(!payload) {
    throw new UnauthorizedException('Invalid refresh token, please login again')
  }

  // 2. check user still exists
  const user = await this.userRepo.findById(payload._id)
  if(!user) {
    throw new UnauthorizedException('User not found, please login again')
  }

  // 3. generate new accessToken only
  const accessToken = this.tokenService.sign(
    { _id: user['_id'], email: user.email },
    { secret: process.env.JWT_SECRET, expiresIn: '1h' }
  )

  return { accessToken }
}

    }