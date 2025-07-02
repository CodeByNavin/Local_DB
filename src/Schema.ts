import LocalDB from './Class';
import crypto from "crypto";

export default class Schema {
    private collectionName: string;
    private schemaDefinition: { [key: string]: any };
    private db: LocalDB;

    constructor(
        db: LocalDB,
        collectionName: string,
        schemaDefinition: { [key: string]: any }
    ) {
        this.db = db;
        this.collectionName = collectionName;
        this.schemaDefinition = schemaDefinition;
    }

    private readCollection() {
        const data = this.db.getData();
        return data[this.collectionName] || [];
    }

    private writeCollection(collectionData: any) {
        const data = this.db.getData();
        data[this.collectionName] = collectionData;
        this.db.setData(data);
    }

    private validateDocument(doc: any) {
        for (const key in this.schemaDefinition) {
            const expectedType = this.schemaDefinition[key];
            const value = doc[key];

            if (value === undefined) {
                throw new Error(`Missing required field: ${key}`);
            }

            // Simple type check (String, Number, Boolean)
            if (
                (expectedType === String && typeof value !== 'string') ||
                (expectedType === Number && typeof value !== 'number') ||
                (expectedType === Boolean && typeof value !== 'boolean')
            ) {
                throw new Error(
                    `Invalid type for field ${key}: expected ${expectedType.name}, got ${typeof value}`
                );
            }
        }
    }

    public async create(query: { [key: string]: any }) {
        try {
            this.validateDocument(query);
            const _id = crypto.randomBytes(30).toString('hex');
            query._id = _id;
            const collection = this.readCollection();
            collection.push(query);
            this.writeCollection(collection);
            return query;
        } catch (error) {
            throw new Error(`Failed to create entry: ` + error);
        }
    }

    public async find(query?: { [key: string]: any }) {
        try {
            const collection = this.readCollection();
            if (!query) {
                return collection;
            } else {
                const [key, value] = Object.entries(query)[0];
                return collection.filter((item: any) => item[key] === value);
            }
        } catch (error) {
            throw new Error(`Failed to find value ` + error);
        }
    }

    public async findOne(query: { [key: string]: any }) {
        const [key, value] = Object.entries(query)[0];
        try {
            const collection = this.readCollection();
            const item = collection.find((item: any) => item[key] === value);
            return item || null;
        } catch (error) {
            throw new Error(`Failed to find value: ${key}, ${value} ` + error);
        }
    }

    public async deleteMany(query: { [key: string]: any }) {
        const [key, value] = Object.entries(query)[0];
        try {
            const collection = this.readCollection();
            const filteredCollection = collection.filter((item: any) => item[key] === value);
            this.writeCollection(filteredCollection);
        } catch (error) {
            throw new Error(`Failed to delete values: ${key}, ${value} ` + error);
        }
    }

    public async deleteOne(query: { [key: string]: any }) {
        const [key, value] = Object.entries(query)[0];
        try {
            const collection = this.readCollection();
            const index = collection.findIndex((item: any) => item[key] === value);
            if (index !== -1) {
                collection.splice(index, 1);
                this.writeCollection(collection);
            }
        } catch (error) {
            throw new Error(`Failed to delete value: ${key}, ${value} ` + error);
        }
    }

    public async updateMany(query: { [key: string]: any }, newValue: { "$set": { [key: string]: any } }) {
        const [key, value] = Object.entries(query)[0];
        try {
            const collection = this.readCollection();
            const updatedCollection = collection.map((item: any) => {
                if (item[key] === value) {
                    const InputValue = newValue["$set"];
                    return { ...item, ...InputValue };
                }
                return item;
            });
            this.writeCollection(updatedCollection);
            return updatedCollection;
        } catch (error) {
            throw new Error(`Failed to update values: ${key}, ${value} ` + error);
        }

    }

    public async findOneAndUpdate(
        query: { [key: string]: any },
        newValue: { "$set": { [key: string]: any } }
    ) {
        const [key, value] = Object.entries(query)[0];
        try {
            const collection = this.readCollection();
            const index = collection.findIndex((item: any) => item[key] === value);
            if (index === -1) {
                throw new Error(`No entry found for key: ${key}, value: ${value}`);
            }
            const InputValue = newValue["$set"];
            collection[index] = { ...collection[index], ...InputValue };
            this.writeCollection(collection);
            return collection[index];
        } catch (error) {
            throw new Error(`Failed to update value: ${key}, ${value} ` + error);
        }
    }

    public async findOneAndDelete(query: { [key: string]: any }) {
        const [key, value] = Object.entries(query)[0];
        try {
            const data = await this.findOne(query);
            if (!data) {
                throw new Error(`No entry found for key: ${key}, value: ${value}`);
            }
            await this.deleteOne(data);
            return data;
        } catch (error) {
            throw new Error(`Failed to find and delete value: ${key}, ${value} ` + error);
        }
    }
}