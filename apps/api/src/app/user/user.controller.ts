import { Body, Controller, Get, OnModuleInit, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserService } from './user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshAccessTokenDto } from '../auth/dto/refresh-access-token.dto';


@Controller('user')
export class UserController implements OnModuleInit {
  constructor(private readonly userService: UserService) {
  }

  onModuleInit(): any {
    this.userService.init();
  }

  @Get()
  async me(@Req() req: Request) {
    return await this.userService.getMe(req);
  }

  @Post('login')
  async login(@Req() req: Request,
              @Res({ passthrough: true }) res: Response,
              @Body() loginUserDto: LoginUserDto) {
    console.log('LOGIN REQUEST', loginUserDto);
    return await this.userService.login(req, res, loginUserDto);
  }

  @Post('refresh')
  async refresh(@Res({ passthrough: true }) res: Response,
                @Body() refreshAccessTokenDto: RefreshAccessTokenDto) {
    return await this.userService.refresh(res, refreshAccessTokenDto);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.userService.logout(req, res);
  }

}
