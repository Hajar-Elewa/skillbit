import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserRepo } from "src/Models/User/user.repo";
import { UserModel } from "src/DB/Models/User/user.model";
import { TokenService } from "src/common/services/token.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";



@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }), // Load .env file and make it available globally
        UserModel],
    controllers: [AuthController],
    providers: [AuthService,UserRepo,TokenService,JwtService]
})

export class AuthModule {}