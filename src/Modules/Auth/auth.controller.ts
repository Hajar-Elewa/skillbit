import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { confirmEmailDto, loginDto, signUpDto } from "./dto";

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
        const user= await this.authService.signUpService(signUpDto)
        return {message:'User created successfully',data:user}
    }

    @Post('confirm-email')
    async confirmEmail(@Body() confirmEmailDto:confirmEmailDto) {
        const {email,otp} = confirmEmailDto
        const result = await this.authService.confirmEmailService(email,otp)
        return {message:'Email confirmed successfully',data:result}
    }

  @Post('login')
  async login(@Body() loginDto:loginDto)
  {
    const token= await this.authService.loginService(loginDto)
    return {message:'User logged in successfully',token}
  }  
}