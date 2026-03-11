import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './Modules/Auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './Modules/User/user.module';
import devConfig from './config/env/dev.config';
import { User, UserSchema } from './Models/User/user.schema';
import { Admin, AdminSchema } from './Models/Admin/admin.sachema';

@Module({
  imports: [ 
    ConfigModule.forRoot({
          load: [devConfig],//loading the devConfig function to get the environment variables defined in it.
          isGlobal:true
    }),
    MongooseModule.forRootAsync({
      inject: [devConfig],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('DATABASE_URL'),//getting the DATABASE_URL from the environment variables using the config service.
      }),
      
    }),
    MongooseModule.forFeature([
   {
    name: User.name,
    schema: UserSchema,

    discriminators: [
      {
        name: Admin.name,
        schema: AdminSchema,
      }
    ],
   }
    ]),
     AuthModule,//importing the auth module to use its services and controllers in the app module.
     UserModule 
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
