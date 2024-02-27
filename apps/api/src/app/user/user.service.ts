import { LoginUserDto } from '../user/dto/login-user.dto';
import { AuthService } from '../auth/auth.service';
import { Request, Response } from 'express';
import { RefreshAccessTokenDto } from '../auth/dto/refresh-access-token.dto';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { omit as _omit } from 'lodash';
import { User, UserdbService } from '../services/userdb.service';

@Injectable()
export class UserService {

  constructor(private readonly authService: AuthService,
              private readonly userService: UserdbService) {

  }

  init() {
    this.userService.generate({
      email: 'leo.olmi@gmail.com',
      name: 'leo',
      roles: ['admin', 'user'],
      hashedPassword: 'admin'
    });
  }

  async me(req: Request) {
    const user = await this.userService.findById((<User>req.user).id);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    return toClientUser(user);
  }

  async getMe(req: Request) {
    const id =  this.authService.getUserId(req);
    const user = await this.userService.findById(id);
    if (!user) {
      throw new BadRequestException('Bad request');
    }
    return toClientUser(user);
  }

  async login(req: Request, res: Response, loginUserDto: LoginUserDto): Promise<User> {
    const us = await this.userService.search(u => u.email === loginUserDto.email);
    if (us.length<1) return Promise.reject('wrong email');
    if (us.length>1) return Promise.reject('too many users with the same email');
    const user = us[0];
    if (user.hashedPassword !== hashPassword(loginUserDto.password)) return Promise.reject('wrong password');
    await this.authService.setSecurity(req, res, user);
    return Promise.resolve(toClientUser(user));
  }

  async refresh(res: Response, refreshAccessTokenDto: RefreshAccessTokenDto): Promise<any> {
    // [DB ACTION] RICERCA REFRESH TOKEN DB (refresh-token)
    const userId = await this.authService.findRefreshToken(refreshAccessTokenDto.refreshToken);
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new BadRequestException('Bad request');
    }
    await this.authService.refreshAccessToken(res, user);
    return Promise.resolve(toClientUser(user));
  }

  async logout(req: Request, res: Response): Promise<boolean> {
    await this.authService.clearTokens(req, res);
    return true;
  }

}

const hashPassword = (psw: string): string => {
  // per il momento non fa niente
  return psw;
}


export const toClientUser = (user: any): any => {
  return _omit(user||{}, ['hashedPassword', 'id']);
}
