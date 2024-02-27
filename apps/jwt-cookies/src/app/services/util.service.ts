import { includes as _includes, trimEnd as _trimEnd, trimStart as _trimStart } from 'lodash';

export const combine = (...args: string[]): string => {
  args.forEach((a, i) => {
    if (i < args.length - 1) a = _trimEnd(a, '/');
    if (i > 0) {
      a = _trimStart(a, '/');
      a = a
        // toglie il ./xxxx ---> xxxx
        .replace(/^\.\//g, '')
        // toglie il /./ ---> /
        .replace(/\/\.\//g, '/');
    }
    args[i] = a;
  });
  return args.join('/');
}
