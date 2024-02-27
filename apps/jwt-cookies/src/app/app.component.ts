import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InteropService } from './services/interop.service';
import { INTEROP } from './model/consts';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  selector: 'jwt-cookies-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit{
  private _interop: InteropService;
  title = 'jwt-cookies';

  constructor() {
    this._interop = inject(INTEROP);
  }

  ngOnInit() {
    this._interop.checkLogin();
  }
}
