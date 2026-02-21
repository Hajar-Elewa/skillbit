import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
  
     async getProfile(userId: string): Promise<TUser> {
    const user = await this.userRepo.findOne({ filter: { _id: userId } });
    if (!user) throw new Error('User not found');
    return user;
  }
}