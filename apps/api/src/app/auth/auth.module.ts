import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { RefreshTokenService } from '../services/refresh-token.service';
import { UserdbService } from '../services/userdb.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', session: true }),
    JwtModule.register({
      secret: environment.jwt.secret,
      signOptions: { expiresIn: environment.jwt.expiration }
    })
  ],
  providers: [
    UserdbService,
    RefreshTokenService,
    AuthService,
    JwtStrategy
  ],
  exports: [AuthService, UserdbService],
})
export class AuthModule {}
