import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { inject } from '@angular/core';
import { INTEROP } from '../model/consts';
import { InteropService } from './interop.service';

export const Interceptor  = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
  if (environment.jwtType === 'headers') {
    const interop: InteropService = inject(INTEROP)
    request = request.clone({
      headers: request.headers.set('Authorization', interop.getAuthorizationHeader())
    });
  }
  return next(request);
}
