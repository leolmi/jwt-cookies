import { Component, inject } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Credentials } from '../model/credentials';
import { INTEROP } from '../model/consts';
import { InteropService } from '../services/interop.service';
import { LogService, Message } from '../services/log.service';



@Component({
  selector: 'home-component',
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.scss',
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ]
})
export class HomeComponent {
  private _interop: InteropService;
  isLogged$: Observable<boolean>;
  content$: BehaviorSubject<string>;
  user$: Observable<any>;
  credentials$: BehaviorSubject<Credentials>;
  showPassword$: BehaviorSubject<boolean>;
  messages$: Observable<Message[]>;

  constructor() {
    this._interop = inject(INTEROP);
    this.content$ = new BehaviorSubject<string>('');
    this.credentials$ = new BehaviorSubject<Credentials>({ email: 'leo.olmi@gmail.com', password: 'admin' });
    this.showPassword$ = new BehaviorSubject<boolean>(false);
    this.user$ = this._interop.user$.pipe(map(u => u));
    this.isLogged$ = this._interop.user$.pipe(map(u => !!u));
    this.messages$ = LogService.messages$.pipe(map(msgs => msgs));

    this.user$
      .pipe(distinctUntilChanged())
      .subscribe(u => this.content$.next(JSON.stringify(u||{}, null, 2)));
  }

  private _update(key: string, value: any) {
    const credentials = {
      ...this.credentials$.value,
      [key]: value
    };
    this.credentials$.next(credentials);
  }

  toggleVisibility() {
    this.showPassword$.next(!this.showPassword$.value);
  }

  change(e: any) {
    this._update(e.target.name, e.target.value);
  }

  login() {
    const cr = this.credentials$.value;
    if (!cr.email || !cr.password) return;
    this._interop.login(cr);
  }

  logout() {
    this._interop.logout();
  }

  test(pub = true) {
    if (pub) {
      this._interop.execPublic();
    } else {
      this._interop.execPrivate();
    }
  }

  changePassword() {
    // this._interop.changePassword()
  }
}
