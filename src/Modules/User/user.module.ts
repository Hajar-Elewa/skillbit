import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepo } from "src/DB/Models/User/user.repo";
import { UserModel } from "src/DB/Models/User/user.model";
import { TokenService } from "src/common";
import { JwtService } from "@nestjs/jwt";


@Module({
    imports: [UserModel],
    controllers: [UserController],
    providers: [
        UserService,
        TokenService,
        UserRepo,
        JwtService
    ],
})
export class UserModule {}