import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from './user.schema'


//Model 
export const UserModel = MongooseModule.forFeature([
  {
    name: User.name,
    schema: UserSchema,
  },
])

//User type
export type TUser = User & Document//this will create a new type that combines the User class with the Mongoose Document interface