import { ConflictException, Injectable } from "@nestjs/common";
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

    async signUpService( signUpDto:signUpDto) {
     const {fullname,email,password,role,level} = signUpDto
     const user = await this.userRepo.findByEmail(email)
      if(user) {
            throw new ConflictException('User already exists')
        } 
        const otp = generateOTP(6)
        await this.userRepo.create({
            fullname,
            email,
            password: await Hash(password),
            role,
            level,
            emailOtp:otp
        })

      await sendEmail({
            to: email,
            from:process.env.EMAIL,
            subject: 'confirmation email',
            html: `<h1>Welcome ${fullname}</h1><p>Thank you for signing up. Please confirm your email address useing this OTP: ${otp}</p>`
        })
       
      
     return await this.userRepo.update({email}, {emailOtp:otp})//this will select the user with the given email and update its otp field with the generated otp.
}

    async confirmEmailService(email:string,otp:string) {
        const user = await this.userRepo.findByEmail(email)
        if(!user) {
            throw new ConflictException('User not found')
        }

        if(user.emailOtp !== otp) { 
            throw new ConflictException('Invalid OTP')
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

    async loginService(loginDto:loginDto) {
        const {email,password} = loginDto
        const user = await this.userRepo.findByEmail(email)
        if(!user) {
            throw new ConflictException('Invalid credentials')
        } 
        if(!compare(password,user.password)) {
            throw new ConflictException('Invalid credentials')
        }
        const token =  this.tokenService.sign({
            _id:user['_id'],   
            email:user.email,
        },
        {
            secret: process.env.JWT_SECRET,
            expiresIn: '1h'
        }
    )
            return token
}

    }