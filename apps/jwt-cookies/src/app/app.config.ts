import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { InteropService } from './services/interop.service';
import { INTEROP } from './model/consts';
import { Interceptor } from './services/interceptor.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([Interceptor])),
    { provide: INTEROP, useClass: InteropService, multi: false },
  ],
};
