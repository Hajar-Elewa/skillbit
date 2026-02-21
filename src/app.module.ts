import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './Modules/Auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { User } from './DB/Models/User/user.schema';
import { UserModule } from './Modules/User/user.module';


@Module({
  imports: [ MongooseModule.forRoot(process.env.DATABASE_URL as string),
    ConfigModule.forRoot({isGlobal:true}),
     AuthModule,//importing the auth module to use its services and controllers in the app module.
     UserModule
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
