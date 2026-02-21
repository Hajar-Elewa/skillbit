import { Controller, Get, Req, SetMetadata, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import  type { Request } from "express";
import { Auth, AuthGuard, RoleGuard, Roles  } from "src/common";

@Controller("user")
export class UserController {
    constructor(private  readonly userService: UserService) {}

    @Get('profile')
    @Auth('admin') // This is a custom decorator that combines the functionality of both AuthGuard and RoleGuard.
    //@UseGuards(AuthGuard, RoleGuard)
    //@Roles(['user'])
    //@SetMetadata('roles',['admin'])
    profile(@Req() req:Request) {
        return {message : "This is the user profile page", this.userService.: req["user"]};
    }
}