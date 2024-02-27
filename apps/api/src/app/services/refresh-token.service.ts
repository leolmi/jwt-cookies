import { DatabaseClass } from './db.service';
import { RefreshToken } from '../auth/interfaces/refresh-token.interface';
import { Injectable } from '@nestjs/common';


export class RefreshTokenEntity implements RefreshToken{
  constructor(t?: Partial<RefreshTokenEntity>) {
    Object.assign(this, t || {});
  }
  id: string;
  userId: string;
  refreshToken: string;
  ip: string;
  browser: string;
  country: string;
}

@Injectable()
export class RefreshTokenService extends DatabaseClass<RefreshTokenEntity> {
  constructor() {
    super('refresh-token');
  }

  async create(t?: Partial<RefreshToken>): Promise<RefreshTokenEntity> {
    return await this.generate(new RefreshTokenEntity(t));
  }
}
