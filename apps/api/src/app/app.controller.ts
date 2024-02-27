import { Controller, Get, Post, UseGuards } from '@nestjs/common';

import { AppService } from './app.service';
import { JwtGuard } from './auth/guards/jwt.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post('public')
  execPublic() {
    return { message: 'this is a public method' };
  }

  @Post('private')
  @UseGuards(JwtGuard)
  execPrivate() {
    return { message: 'this is a private method' };
  }
}
