import { JwtType } from './environment.common';

export const environment = {
  jwt: {
    mode: JwtType.headers,
    secret: process.env.JWT_SECRET || 'MY-JWT-SECRET',
    encryptSecret: process.env.ENCRYPT_JWT_SECRET || 'MY-ENCRYPT-JWT-SECRET',
    expiration: process.env.JWT_EXPIRATION || '60m',
    expiration_mls: parseInt(process.env.JWT_EXPIRATION_MLS, 10) || (1000 * 60 * 60),
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '24h',
    refreshExpiration_mls: parseInt(process.env.JWT_REFRESH_EXPIRATION_MLS) || (1000 * 60 * 60 * 24),
  }
}
