import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { Auth, AuthGuard } from "src/common";
import { changePasswordDto, updateProfileDto } from "./dto";
import type { AuthReq } from "src/common/AuthReq";
import { FileInterceptor } from "@nestjs/platform-express";
import { localFileUpload } from "src/common/utils/multer/uploads";

@Controller("user")
@UseGuards(AuthGuard)
export class UserController {
    constructor(private  readonly userService: UserService) {}

    @Get('my-profile')
    async getMyProfile(@Req() req: AuthReq) {
     const user = await this.userService.getMyProfile(req.user['_id'])
     return { message: 'Profile fetched successfully', data: user }
}

    @Get('profile/:id')
    async getUserProfile(@Param('id') userId: string) {
     const user = await this.userService.getUserProfile(userId)
     return { message: 'Profile fetched successfully', data: user }
}
    
   @Patch('update-profile')
     async updateProfile(@Req() req: AuthReq, @Body() updateProfileDto: updateProfileDto) {
     const user = await this.userService.updateProfile(req.user['_id'], updateProfileDto)
     return { message: 'Profile updated successfully', data: user }
}

    @Delete('delete')
        async deleteUser(@Req() req: AuthReq) {
        await this.userService.deleteUser(req.user['_id'])
        return { message: 'User deleted successfully' }
        }
    
    @Patch('change-password')
    async changePassword(@Req() req: AuthReq, @Body() changePasswordDto: changePasswordDto) {
        await this.userService.changePassword(req.user['_id'],changePasswordDto)//changePasswordDto holds oldPassword and newPassword
        return { message: 'Password changed successfully' }
    }  
    
    @Post('logout')
    async logout() {
      return { message: 'Logged out successfully' }
}

   @Post('send-friend-request/:id')
   async sendFriendRequest(@Param('id') toId: string, @Req() req: AuthReq) {
     await this.userService.sendFriendRequest(req.user['_id'], toId)
     return { message: 'Friend request sent successfully' }
}

   @Patch('accept-friend-request/:id')
   async acceptFriendRequest(@Param('id') fromId: string, @Req() req: AuthReq) {
   await this.userService.acceptFriendRequest(req.user, fromId)
   return { message: 'Friend request accepted successfully' }
}
 
   @Patch('reject-friend-request/:id')
   async rejectFriendRequest(@Param('id') fromId: string, @Req() req: AuthReq) {
    await this.userService.rejectFriendRequest(req.user, fromId)
    return { message: 'Friend request rejected successfully' }
}

  @Delete('remove-friend/:id')
  async removeFriend(@Param('id') friendId: string, @Req() req: AuthReq) {
   await this.userService.removeFriend(req.user, friendId)
   return { message: 'Friend removed successfully' }
}

   @Get('friends')
   async getFriends(@Req() req: AuthReq) {
   const friends = await this.userService.getFriends(req.user['_id'])
   return { message: 'Friends fetched successfully', data: friends }
}


@Patch('upload')
@UseInterceptors(FileInterceptor('file' , localFileUpload()))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  console.log(file);
}

}