import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { UserLevels, UserRoles } from "src/common"


@Schema({ timestamps: true })
export class User {

  @Prop({ type: String, required: true })
  fullname: string

  @Prop({ type: String, required: true, unique: true })
  email: string

  @Prop({ type: String })
  password: string

  @Prop({ type: Number })
  age: number

  @Prop({ type: String })
  gender: string


  @Prop({ type: String, enum: UserRoles , default: UserRoles.User })
  role: string
 
  
  @Prop({ type: String , enum:UserLevels, default:UserLevels.Beginner})
  level:string

  @Prop({ type: Boolean, default: false })
  isVerified: boolean

  @Prop({ type: String , expires: '10m' })// meaning that the otp will be automatically deleted from the database after 10 minutes.
  emailOtp: string

  @Prop()
  profilePic?: string; 
}
//Schema 
export const UserSchema = SchemaFactory.createForClass(User)