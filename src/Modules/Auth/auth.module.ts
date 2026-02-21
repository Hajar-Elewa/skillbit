import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserRepo } from "src/DB/Models/User/user.repo";
import { UserModel } from "src/DB/Models/User/user.model";
import { TokenService } from "src/common/services/token.service";
import { JwtService } from "@nestjs/jwt";



@Module({
    imports: [UserModel],
    controllers: [AuthController],
    providers: [AuthService,UserRepo,TokenService,JwtService]
})

export class AuthModule {}
