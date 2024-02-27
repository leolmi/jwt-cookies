import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtType } from '../../environments/environment.common';
import { environment } from '../../environments/environment';
import { Request, Response } from 'express';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ClientUser, User, UserdbService } from '../services/userdb.service';
import { sign } from 'jsonwebtoken';
import { RefreshTokenService } from '../services/refresh-token.service';
import { getClientIp } from 'request-ip';
import { v4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import Cryptr from 'cryptr';


export const COOKIE_NAME_ACCESS_TOKEN = 'user_access_token';
export const COOKIE_NAME_REFRESH_TOKEN = 'user_refresh_token';

@Injectable()
export class AuthService {
  //private _crypto: Cryptr;

  constructor(private readonly refreshTokenService: RefreshTokenService,
              private readonly userService: UserdbService,
              private readonly jwtService: JwtService) {
    // this._crypto = new Cryptr(environment.jwt.encryptSecret);
    console.log(`security on ${environment.jwt.mode} started`);
  }

  /**
   * CREA IL TOKEN D'ACCESSO
   * @param userId
   * @param encrypt
   */
  async createAccessToken(userId: string, encrypt = false) {
    let token = sign({userId}, environment.jwt.secret , { expiresIn: environment.jwt.expiration });
    if (encrypt) {
      const crypto = new Cryptr(environment.jwt.encryptSecret);
      token = crypto.encrypt(token);
    }
    return token;
  }

  /**
   * CREA IL TOKEN DI REFRESH
   * @param req
   * @param userId
   */
  async createRefreshToken(req: Request, userId) {
    // [DB ACTION] SALVA REFRESH TOKEN DB (refresh-token)
    const refreshToken = await this.refreshTokenService.create({
      userId,
      refreshToken: v4(),
      ip: this.getIp(req),
      browser: this.getBrowserInfo(req),
      country: this.getCountry(req),
    });
    return refreshToken.refreshToken;
  }


  /**
   * EXTRACTOR
   * @param req
   * @private
   */
  jwtExtractor(req: Request) {
    if (environment.jwt.mode === JwtType.headers) {
      return getRequestTokenByHeader(req);
    } else {
      return getRequestTokenByCookie(req);
    }
  }

  async findRefreshToken(rt: string ): Promise<string> {
    // [DB ACTION] ricerca refresh token da db (refresh-token)
    const entity = await this.refreshTokenService.find(t => t.refreshToken === rt);
    return Promise.resolve(entity?.userId);
  }

  /**
   * imposta il token di accesso
   * @param res
   * @param user
   */
  async setAccessTokenCookie(res: Response, user: User) {
    const at = await this.createAccessToken(user.id);
    res.cookie(COOKIE_NAME_ACCESS_TOKEN, at, {
      expires: new Date(Date.now() + environment.jwt.expiration_mls),
      httpOnly: true
    });
  }

  /**
   * imposta entrambi i token (accesso e refresh) sui cookies
   * @param req
   * @param res
   * @param user
   */
  async setCookiesSecurity(req: Request, res: Response, user: User) {
    await this.setAccessTokenCookie(res, user);
    const rt = await this.createRefreshToken(req, user.id);
    res.cookie(COOKIE_NAME_REFRESH_TOKEN, rt, {
      expires: new Date(Date.now() + environment.jwt.refreshExpiration_mls),
      httpOnly: true,
    });
  }

  /**
   * imposta la sicurezza su header
   * @param req
   * @param res
   * @param user
   */
  async setHeadersSecurity(req: Request, res: Response, user: ClientUser) {
    user.accessToken = await this.createAccessToken(user.id, true);
    user.refreshToken = await this.createRefreshToken(req, user.id);
    console.log('header security set', user);
  }

  /**
   * imposta le informazioni di sicurezza a seconda del tipo
   * @param req
   * @param res
   * @param user
   */
  async setSecurity(req: Request, res: Response, user: User) {
    if (environment.jwt.mode === JwtType.headers) {
      await this.setHeadersSecurity(req, res, user);
    } else {
      await this.setCookiesSecurity(req, res, user);
    }
  }

  /**
   * aggiorna il token di accesso
   * @param res
   * @param user
   */
  async refreshAccessToken(res: Response, user: User) {
    if (environment.jwt.mode === JwtType.headers) {
      (<ClientUser>user).accessToken = await this.createAccessToken(user.id, true);
    } else {
      await this.setAccessTokenCookie(res, user);
    }
  }

  /**
   * elimina i token client svuotandoli e impostando una scadenza immediata
   * @param req
   * @param res
   */
  async clearTokens(req: Request, res: Response) {
    const userId = this.getUserId(req);
    if (userId) await this.refreshTokenService.delete(rt => rt.userId === userId);
    if (environment.jwt.mode !== JwtType.headers) {
      const now = new Date(Date.now());
      res.cookie(COOKIE_NAME_ACCESS_TOKEN, '', { expires: now });
      res.cookie(COOKIE_NAME_REFRESH_TOKEN, '', { expires: now });
    }
  }

  /**
   * valida l'utente
   * @param payload
   */
  async validateUser(payload: JwtPayload): Promise<User> {
    return await this.userService.findById(payload?.userId)
  }

  getUserId(req: Request) {
    const token = this.jwtExtractor(req);
    return this.jwtService.decode(token)?.userId;
  }

  getIp(req: Request): string {
    return getClientIp(req);
  }

  getBrowserInfo(req: Request): string {
    return req.header['user-agent'] || 'XX';
  }

  getCountry(req: Request): string {
    return req.header['cf-ipcountry'] ? req.header['cf-ipcountry'] : 'XX';
  }
}

const getRequestTokenByCookie = (req: Request) => {
  let token = null;
  if (req.cookies && COOKIE_NAME_ACCESS_TOKEN in req.cookies && req.cookies[COOKIE_NAME_ACCESS_TOKEN].length>0) {
    token = req.cookies[COOKIE_NAME_ACCESS_TOKEN];
  }
  return token;
}

const getRequestTokenByHeader = (req: Request) => {
  let token = null;
  if (req.header('x-token')) {
    token = req.get('x-token');
  } else if (req.headers.authorization) {
    token = req.headers.authorization.replace('Bearer ', '').replace(' ', '');
  } else if (req.body.token) {
    token = req.body.token.replace(' ', '');
  }
  if (req.query.token) {
    token = req.body.token.replace(' ', '');
  }
  if (token) {
    try {
      const crypto = new Cryptr(environment.jwt.encryptSecret);
      console.log('trying to decode token', token);
      token = crypto.decrypt(token);
      // if (AuthService.lockedTokenCache[token]) token = null;
    } catch (err) {
      console.error('cannot decript token', err);
      throw new BadRequestException('Bad request.');
    }
  }
  return token;
}
