import { DatabaseClass } from './db.service';

export class User {
  constructor(u?: Partial<User>) {
    Object.assign(this, u || {});
  }
  id: string;
  name: string;
  email: string;
  hashedPassword: string;

  roles: string[];
}

export interface ClientUser {
  id?: string;
  name: string;
  email: string;
  roles: string[];
  accessToken?: string;
  refreshToken?: string;
}

export class UserdbService extends DatabaseClass<User> {
  constructor() {
    super('user');
  }
}
