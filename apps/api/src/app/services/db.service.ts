import { guid } from './util.service';
import { remove as _remove } from 'lodash';

export interface DbElement {
  id?: string;
}

export class DataSet {
  private readonly _name: string;
  private readonly _elements: DbElement[];
  private readonly _elementsMap: {[id: string]: DbElement};

  constructor(n: string) {
    this._name = n;
    this._elements = [];
    this._elementsMap = {};
  }

  private _add(e: DbElement) {
    e.id = e.id || guid();
    if (this.data._elementsMap[e.id]) _remove(this.data._elements, xe => xe.id === e.id);
    this.data._elementsMap[e.id] = e;
    this.data._elements.push(e);
  }

  get name() {
    return this._name;
  }

  private get data() {
    return DATABASE.on(this.name);
  }

  create(d?: any) {
    this._add(d);
    return d;
  }
  getById(id: string) {
    return this.data._elementsMap[id];
  }
  find(iterator: (e: any) => boolean) {
    return this.data.find(iterator);
  }
  search<T extends DbElement>(iterator: (e: T) => boolean): DbElement[] {
    return this.data._elements.filter(iterator);
  }
  delete(id: string) {
    delete this.data._elementsMap[id];
    _remove(this.data._elements, (e: any) => e?.id === id);
  }
  deleteAll<T extends DbElement>(iterator: (e: T) => boolean): DbElement[] {
    const deleted = _remove(this.data._elements, iterator);
    deleted.forEach(d => delete this.data._elementsMap[d.id]);
    return deleted;
  }

}

class VirtualDB {
  private _db: {[name: string]: DataSet} = {};

  // [name: string]: DataSet;
  on(name: string) {
    this._db[name] = this._db[name] || new DataSet(name);
    return this._db[name];
  }
}

export class DatabaseClass<T extends DbElement> {
  constructor(protected name: string) {
  }

  private get db() {
    return DATABASE.on(this.name);
  }

  async generate(args: Partial<T>): Promise<T> {
    return <T>this.db.create(args);
  }

  async findById(id: string): Promise<T> {
    return <T>this.db.getById(id);
  }

  async find(iterator: (item: T) => boolean): Promise<T> {
    return <T>this.db.find(iterator);
  }

  async delete(iterator: (item: T) => boolean): Promise<T[]> {
    return <T[]>this.db.deleteAll(iterator);
  }

  async search(iterator: (item: T) => boolean): Promise<T[]> {
    return <T[]>this.db.search(iterator);
  }
}

export const DATABASE = new VirtualDB();
