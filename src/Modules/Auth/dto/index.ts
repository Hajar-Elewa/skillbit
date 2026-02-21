import { IsEmail, IsIn, IsNotEmpty, IsString, IsStrongPassword, MinLength } from "class-validator";
import { UserLevels, UserRoles } from "src/common";


export class signUpDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    fullname:string;

    @IsString()
    @IsEmail()
    email:string;

    @IsStrongPassword()
    @IsNotEmpty()
    password:string;

    @IsStrongPassword()
    @IsNotEmpty()
    confirmPassword:string;

    @IsString()
    @IsIn(Object.values(UserRoles)) // Ensure role is one of the allowed values
     role:string;

    @IsString()
    @IsIn(Object.values(UserLevels))
    level:string;
}
export class confirmEmailDto {
    @IsString()
    @IsEmail()
    email:string;

    @IsString()
    @IsNotEmpty()
    otp:string;
}
export class loginDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email:string;

    @IsStrongPassword()
    @IsNotEmpty()
    password:string;
}