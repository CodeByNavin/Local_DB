import Schema from './Schema';
export default class LocalDB {
    private DB_File;
    constructor(DB_File: string);
    private readData;
    private writeData;
    getData(): any;
    setData(data: any): void;
    Schema: typeof Schema;
}
//# sourceMappingURL=Class.d.ts.map