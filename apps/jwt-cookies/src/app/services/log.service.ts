import { BehaviorSubject } from 'rxjs';

export type MessageType = 'info'|'error'|'warning'|'success';

export class Message {
  constructor(m?: Partial<Message>) {
    this.text = '';
    this.type = 'info';
    Object.assign(this, m || {});
  }
  text: string;
  type: MessageType;
  data?: any;
}


export class LogService {
  static messages$: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);

  static log = (text?: string, data?: any, type: MessageType = 'info')=> {
    this.messages$.next(this.messages$.value.concat(new Message({ text, data, type })));
  }

  static error = (text: string, data?: any) => this.log(text, data, 'error');

  static warn = (text: string, data?: any) => this.log(text, data, 'warning');
}
