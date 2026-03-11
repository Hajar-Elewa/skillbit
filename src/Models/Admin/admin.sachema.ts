import { Schema, SchemaFactory } from '@nestjs/mongoose';


@Schema({timestamps:true , discriminatorKey:'role'})
export class Admin  {
  fullname: string;
  profilePicture: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);