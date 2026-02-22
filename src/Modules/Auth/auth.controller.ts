import { Body, Controller, Post ,Req,Res, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { confirmEmailDto, loginDto, signUpDto } from "./dto";
import { Throttle } from "@nestjs/throttler";
import type { Response,Request } from "express";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService:AuthService) {}
  @Post('signup')
   async signup(@Body()
                 signUpDto:signUpDto
        // new ValidationPipe({ whitelist: true }))
        //  body:signUpDto

        // new ZodPipe(signupSchema))
        //   body:signUpZodDto
    )
        {
        const user= await this.authService.signUp(signUpDto)
        return {message:'User created successfully',data:user}
    }

    @Post('confirm-email')
    async confirmEmail(@Body() confirmEmailDto:confirmEmailDto) {
        const {email,otp} = confirmEmailDto
        const result = await this.authService.confirmEmail(email,otp)
        return {message:'Email confirmed successfully',data:result}
    }

    @Throttle({ default: { limit: 3, ttl: 60 } }) // max 3 requests per 60 seconds
    @Post('resend-otp')
    async resendOtp(@Body('email') email: string) {
        await this.authService.resendOtp(email)
        return { message: 'OTP resent successfully, please check your email' }  
    }


    @Post('login')
   async login(@Body() loginDto: loginDto, @Res() res: Response) {

      const { accessToken, refreshToken } = await this.authService.login(loginDto)

  // store refreshToken in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
         httpOnly: true,                       // javascript cannot read it
         secure: true,                         // only sent over HTTPS
         sameSite: 'strict',                   // prevents CSRF attacks
         maxAge: 7 * 24 * 60 * 60 * 1000      // 7 days in milliseconds
  })

      //return {message:'Login successful', accessToken}
      return res.json({ accessToken })
}

    @Post('refresh')
     async refresh(@Req() req: Request, @Res() res: Response) {

  // read refreshToken from cookie automatically
  const refreshToken = req.cookies['refreshToken']

  if(!refreshToken) {
    throw new UnauthorizedException('No refresh token found, please login again')
  }

  const { accessToken } = await this.authService.login(refreshToken)

  return res.json({ accessToken })
}
// @Post('logout')
// async logout() {
//   await this.authService.logout()
//   return { message: 'User logged out successfully' }
// }
}