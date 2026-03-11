import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { compare, generateOTP, Hash, sendEmail, TokenService } from 'src/common';
import { UserRepo } from "src/Models/User/user.repo";
import { googleLoginDto, loginDto, signUpDto } from "./dto";
import { OAuth2Client } from "google-auth-library";

@Injectable()
export class AuthService {
constructor(
    private readonly userRepo:UserRepo,
    private readonly tokenService:TokenService

) {}

//with google and github we will skip email verification and directly set isVerified to true
    async signUp( signUpDto:signUpDto) {
     const {fullname,email,password,role,level,isFirstTime} = signUpDto
     const user = await this.userRepo.findByEmail(email)
      if(user) {
            throw new ConflictException('User already exists')
        } 

        const otp = generateOTP(6)

       const emailSent = await sendEmail({
          to: email,
          from: process.env.EMAIL,
          subject: 'confirmation email',
          html: `<h1>Welcome ${fullname}</h1><p>Please confirm your email using this OTP: ${otp}</p>`
        })

          if (!emailSent) {
            throw new InternalServerErrorException('Failed to send email, please try again')
        }
    
        const createdUser = await this.userRepo.create({
            fullname,
            email,
            password: await Hash(password),
            role,
            level,
            isFirstTime,
            emailOtp: {
                code: otp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000) // OTP expires in 10 minutes
            }
        })

  return {
        fullname: createdUser.fullname,
        email: createdUser.email,
        role: createdUser.role,
}
}

    async googleLogin(googleLoginDto:googleLoginDto) {
       //get data from request
       const {idToken} =googleLoginDto

       //verify the token with google
       const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
       const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID  // to ensure the token is meant for our app only and not some other app that also uses google login
       })
        const payload = ticket.getPayload()
        if(!payload) {
            throw new UnauthorizedException('Invalid Google token')
        }

        //check if user already exists in our database
        let user = await this.userRepo.findByEmail(payload.email??'') // if payload.email is undefined use empty string to avoid error in findByEmail

        if(!user) {
            //if not exist create new user with data from google and mark email as verified since google already verified it
            user = await this.userRepo.create({
                fullname: payload.name,
                email: payload.email,
                googleId: payload.sub,
                isVerified: true, // since google already verified the email
                role: 'user', // default role for google signups
                isFirstTime: true, // can be used to show onboarding or not
                  userAgent: 'google', // to know that this user signed up with google and not local to avoid password requirement in user schema.
            })
        }

        //generate accessToken and refreshToken for the user
        const accessToken = this.tokenService.sign(
            { _id: user['_id'], email: user.email },
            { secret: process.env.JWT_SECRET, expiresIn: '3h' }
        ) 
        const refreshToken = this.tokenService.sign(
            { _id: user['_id'], email: user.email },
            { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '4d' }
        )
        
        return {
            accessToken,
            refreshToken,
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
            
             const emailSent = await sendEmail({
             to: email,
            from: process.env.EMAIL,
            subject: 'New OTP Request',
            html: `<h1>Hello ${user.fullname}</h1>
                   <p>Your new OTP is: <strong>${otp}</strong></p>
                   <p>This OTP will expire in 10 minutes.</p>`
           })

          if (!emailSent) {
            throw new InternalServerErrorException('Failed to send email, please try again')
        }

             await this.userRepo.update(
                  { email },
                  {
                    emailOtp: {
                    code: otp,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // fresh 10 minutes
                }
    }
  )
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
            { secret: process.env.JWT_SECRET, expiresIn: '3h' }
        )

        
        const refreshToken = this.tokenService.sign(
            { _id: user['_id'], email: user.email },
            { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '4d' }
        )
        
             return {
                accessToken,
                refreshToken,
            }
}

   async refreshToken(token: string) {
  const payload = this.tokenService.verify({
    token,
    options: { secret: process.env.JWT_REFRESH_SECRET }
  })

  const user = await this.userRepo.findById(payload._id)
  if (!user) {
    throw new UnauthorizedException('Invalid token')
  }

  const accessToken = this.tokenService.sign(
    { _id: user['_id'], email: user.email },
    { secret: process.env.JWT_SECRET, expiresIn: '3h' }
  )

  const refreshToken = this.tokenService.sign(
    { _id: user['_id'], email: user.email },
    { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '4d' }
  )

  return { accessToken, refreshToken }
}

    async forgotPassword(email: string) {
       const user = await this.userRepo.findByEmail(email)
        if (!user) {
          throw new NotFoundException('User not found')
        }

        const otp = generateOTP(6)

       const emailSent = await sendEmail({
          to: email,
          from: process.env.EMAIL,
          subject: 'Reset Password',
          html: `<h1>Hello ${user.fullname}</h1>
                 <p>Your reset password OTP is: <strong>${otp}</strong></p>
                 <p>This OTP will expire in 10 minutes.</p>`
  })

          if (!emailSent) {
             throw new InternalServerErrorException('Failed to send email, please try again')
          }

       await this.userRepo.update(
          { email },
          {
           emailOtp: {
           code: otp,
           expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    }
  )

  return true
}

    async resetPassword(email: string, otp: string, newPassword: string) {
        const user = await this.userRepo.findByEmail(email) 
        if(!user) {
            throw new NotFoundException('User not found')
        }

        if(!user.emailOtp || user.emailOtp.expiresAt < new Date() || user.emailOtp.code !== otp) { 
            throw new BadRequestException('OTP expired, request a new one')
        }

         const isSamePassword = await compare(newPassword, user.password)
           if(isSamePassword) {
             throw new BadRequestException('New password cannot be same as old password')
         }

        await this.userRepo.update(
            { email },
            {
               $unset: {
               emailOtp: ""
              },
              password: await Hash(newPassword)
              }
  )
  return true
}
}