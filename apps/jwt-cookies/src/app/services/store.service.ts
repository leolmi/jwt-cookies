export class StoreService {

  static getItem = <T>(key: string): T|undefined => {
    let o: T|undefined = undefined;
    const ser = localStorage.getItem(key);
    if (ser) {
      try {
        o = <T>JSON.parse(ser);
      } catch (err) {
        console.warn('cannot deserialize storage value', ser);
      }
    }
    return o;
  }

  static setItem = (key: string, value: any) => {
    if (!value) {
      localStorage.removeItem(key);
    } else {
      const ser = JSON.stringify(value);
      localStorage.setItem(key, ser);
    }
  }
}
