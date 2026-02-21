import { Injectable } from '@nestjs/common'
import { Model, UpdateQuery } from 'mongoose'
import { TUser } from 'src/DB/Models/User/user.model'
import { InjectModel } from '@nestjs/mongoose'
import { DBService } from 'src/DB/db.service'
import { User } from './user.schema'

@Injectable() //MAKE THIS CLASS INJECTABLE SO THAT IT CAN BE USED AS A PROVIDER[service,repo,...] IN NESTJS
export class UserRepo extends DBService<TUser> {
  constructor(@InjectModel(User.name) private userModel: Model<TUser>) {
    super(userModel)//SUPER MEANS CALL THE CONSTRUCTOR OF THE PARENT CLASS DBService
  }

  async findByEmail(email: string): Promise<TUser | null> {
    return await this.findOne({ filter: { email } })
  }

  async update(filter: Partial<TUser>, updateData:UpdateQuery<TUser>) {
  return await this.findOneAndUpdate({
    filter,
    update: updateData,
    options: { new: true } //this will return the updated document instead of the old one.
  })
} 
}