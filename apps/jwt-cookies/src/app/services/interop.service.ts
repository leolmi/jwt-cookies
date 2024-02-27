import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { combine } from './util.service';
import { Credentials } from '../model/credentials';
import { BehaviorSubject, catchError, distinctUntilChanged, of, take } from 'rxjs';
import { pick as _pick } from 'lodash';
import { Token } from '../model/token';
import { StoreService } from './store.service';
import { LogService } from './log.service';


const TOKEN_STORAGE_KEY = 'USER-TOKEN';

export class InteropService {
  private _http: HttpClient;
  origin: string;
  user$: BehaviorSubject<any>;
  token$: BehaviorSubject<Token|undefined>;

  constructor() {
    this._http = inject(HttpClient);
    this.origin = (environment.origin || location.origin);
    this.user$ = new BehaviorSubject<any>(null);
    this.token$ = new BehaviorSubject<Token|undefined>(StoreService.getItem<Token>(TOKEN_STORAGE_KEY));

    this.token$.pipe(distinctUntilChanged()).subscribe(tk => StoreService.setItem(TOKEN_STORAGE_KEY, tk));
  }

  getUrl = (path: string) => combine(this.origin, path);

  checkLogin() {
    this._http.get(this.getUrl(`api/user`))
      .pipe(
        catchError(err => {
          LogService.log('error while retrieve me', err);
          return of({})
        })
      )
      .subscribe((r: any) => {
        LogService.log('me executed', r);
        if (r?.email) {
          this.user$.next(_pick(r, ['name', 'roles', 'email']));
        } else {
          this._clearUserData();
        }
      })
  }

  login(credentials: Credentials) {
    this._http.post(this.getUrl('api/user/login'), credentials)
      .pipe(
        catchError(err => {
          LogService.error('error while login', err);
          return of(false)
        })
      ).subscribe((r: any) => {
        LogService.log('login result', r);
        if (r) {
          this.user$.next(_pick(r, ['name', 'roles', 'email']));
          this.token$.next(_pick(r, ['accessToken', 'refreshToken']));
        } else {
          this._clearUserData();
        }
      });
  }

  private _clearUserData() {
    LogService.log('clearing user data');
    this.user$.next(undefined);
    this.token$.next(undefined);
  }

  logout() {
    this._http.post(this.getUrl('api/user/logout'), {})
      .subscribe(() => this._clearUserData());
  }

  execPrivate = () => {
    this._http.post(this.getUrl('api/private'), {})
      .pipe(
        take(1),
        catchError((err, e) => {
          LogService.error('error while executing private method', err);
          return of(null);
        }))
      .subscribe((r) => r ? LogService.log('private method executed successfully', r, 'success') : null);
  }

  execPublic = () => {
    this._http.post(this.getUrl('api/public'), {})
      .pipe(
        take(1),
        catchError((err, e) => {
          LogService.error('error while executing public method', err);
          return of(null);
        }))
      .subscribe((r) => r ? LogService.log('public method executed successfully', r, 'success') : null);
  }

  getAuthorizationHeader(): string {
    return this.token$.value?.accessToken ? `Bearer ${this.token$.value?.accessToken || ''}` : ``;
  }
}
