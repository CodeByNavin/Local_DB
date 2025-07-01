import { readFileSync, writeFileSync } from 'fs';
import Schema from './Schema';

export default class LocalDB {
  private DB_File: string;

  constructor(DB_File: string) {
    this.DB_File = DB_File;
  }

  private readData() {
    try {
      const data = readFileSync(this.DB_File, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('ENOENT')) {
        return {};
      }
      throw new Error(`Failed to read JSON file: ${error}`);
    }
  }

  private writeData(data: any) {
    try {
      const JSONString = JSON.stringify(data, null, 2);
      writeFileSync(this.DB_File, JSONString, 'utf8');
    } catch (error) {
      throw new Error(`Failed to write JSON file: ${error}`);
    }
  }

  // Public getters to allow Schema access without exposing private methods directly
  public getData() {
    return this.readData();
  }

  public setData(data: any) {
    this.writeData(data);
  }

  public Schema = Schema;

  // ... your other existing methods ...
}