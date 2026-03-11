import { Body, Controller, Post ,Req,Res, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { confirmEmailDto, forgotPasswordDto, loginDto, resendOtpDto, resetPasswordDto, signUpDto } from "./dto";
import { Throttle } from "@nestjs/throttler";
import type { Response,Request } from "express";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService:AuthService) {}

  @Post('signup')
   async signup(@Body()  signUpDto:signUpDto)
        {
        const user= await this.authService.signUp(signUpDto)
        return {message:'Account created successfully , Please confirm your email',data:user}
    }


    @Post('confirm-email')
    async confirmEmail(@Body() confirmEmailDto:confirmEmailDto) {
        const {email,otp} = confirmEmailDto
        const result = await this.authService.confirmEmail(email,otp)
        return {message:'Email confirmed successfully',data:result}
    }


    @Throttle({ default: { limit: 3, ttl: 60 } }) // max 3 requests per 60 seconds
    @Post('resend-otp')
    async resendOtp(@Body() resendOtpDto:resendOtpDto) {
        await this.authService.resendOtp(resendOtpDto.email)
        return { message: 'OTP resent successfully, please check your email' }  
    }


    @Post('google-login')
    async googleLogin(@Body('idToken') idToken: string) {
        const { accessToken, refreshToken } = await this.authService.googleLogin({ idToken }) 
         return { accessToken, refreshToken }
    }

    @Post('login')
    async login(@Body() loginDto: loginDto, @Res({ passthrough: true }) res: Response) {

      const { accessToken, refreshToken } = await this.authService.login(loginDto)

   // store refreshToken in httpOnly cookie
       res.cookie('refreshToken', refreshToken, {
         httpOnly: true,
         secure: false, // لازم تبقى false على localhost
         sameSite: 'lax',
         maxAge: 7 * 24 * 60 * 60 * 1000
})

     // return {message:'Login successful', accessToken}
      return res.json({ accessToken })
}
 
     @Post('refresh')
    async refreshToken(@Body() body: { refreshToken: string }) {
  const result = await this.authService.refreshToken(body.refreshToken)
  return { message: 'Token refreshed successfully', data: result }
   }

    @Post('forgot-password')
    async forgotPassword(@Body() body: forgotPasswordDto) {
       await this.authService.forgotPassword(body.email)
       return { message: 'OTP sent to your email' }
}

    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: resetPasswordDto) {
       const { email, otp, newPassword } = resetPasswordDto
         await this.authService.resetPassword(email, otp, newPassword)
         return { message: 'Password reset successfully, you can now login' }
}
}