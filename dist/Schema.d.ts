import LocalDB from './Class';
export default class Schema {
    private collectionName;
    private schemaDefinition;
    private db;
    constructor(db: LocalDB, collectionName: string, schemaDefinition: {
        [key: string]: any;
    });
    private readCollection;
    private writeCollection;
    private validateDocument;
    create(query: {
        [key: string]: any;
    }): Promise<{
        [key: string]: any;
    }>;
    find(query?: {
        [key: string]: any;
    }): Promise<any>;
    findOne(query: {
        [key: string]: any;
    }): Promise<any>;
    deleteMany(query: {
        [key: string]: any;
    }): Promise<void>;
    deleteOne(query: {
        [key: string]: any;
    }): Promise<void>;
    findOneAndUpdate(query: {
        [key: string]: any;
    }, newValue: {
        [key: string]: any;
    }): Promise<any>;
    findOneAndDelete(query: {
        [key: string]: any;
    }): Promise<any>;
}
//# sourceMappingURL=Schema.d.ts.map