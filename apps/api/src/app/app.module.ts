import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserService } from './user/user.service';
import { UserdbService } from './services/userdb.service';

@Module({
  imports: [
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client/browser'),
    }),
  ],
  controllers: [
    AppController,
    UserController
  ],
  providers: [
    AppService,
    UserService
  ],
})
export class AppModule {}
