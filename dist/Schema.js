"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
class Schema {
    constructor(db, collectionName, schemaDefinition) {
        this.db = db;
        this.collectionName = collectionName;
        this.schemaDefinition = schemaDefinition;
    }
    readCollection() {
        const data = this.db.getData();
        return data[this.collectionName] || [];
    }
    writeCollection(collectionData) {
        const data = this.db.getData();
        data[this.collectionName] = collectionData;
        this.db.setData(data);
    }
    validateDocument(doc) {
        for (const key in this.schemaDefinition) {
            const expectedType = this.schemaDefinition[key];
            const value = doc[key];
            if (value === undefined) {
                throw new Error(`Missing required field: ${key}`);
            }
            // Simple type check (String, Number, Boolean)
            if ((expectedType === String && typeof value !== 'string') ||
                (expectedType === Number && typeof value !== 'number') ||
                (expectedType === Boolean && typeof value !== 'boolean')) {
                throw new Error(`Invalid type for field ${key}: expected ${expectedType.name}, got ${typeof value}`);
            }
        }
    }
    async create(query) {
        try {
            this.validateDocument(query);
            const _id = crypto_1.default.randomBytes(30).toString('hex');
            query._id = _id;
            const collection = this.readCollection();
            collection.push(query);
            this.writeCollection(collection);
            return query;
        }
        catch (error) {
            throw new Error(`Failed to create entry: ` + error);
        }
    }
    async find(query) {
        try {
            const collection = this.readCollection();
            if (!query) {
                return collection;
            }
            else {
                const [key, value] = Object.entries(query)[0];
                return collection.filter((item) => item[key] === value);
            }
        }
        catch (error) {
            throw new Error(`Failed to find value ` + error);
        }
    }
    async findOne(query) {
        const [key, value] = Object.entries(query)[0];
        try {
            const collection = this.readCollection();
            const item = collection.find((item) => item[key] === value);
            return item || null;
        }
        catch (error) {
            throw new Error(`Failed to find value: ${key}, ${value} ` + error);
        }
    }
    async deleteMany(query) {
        const [key, value] = Object.entries(query)[0];
        try {
            const collection = this.readCollection();
            const filteredCollection = collection.filter((item) => item[key] === value);
            this.writeCollection(filteredCollection);
        }
        catch (error) {
            throw new Error(`Failed to delete values: ${key}, ${value} ` + error);
        }
    }
    async deleteOne(query) {
        const [key, value] = Object.entries(query)[0];
        try {
            const collection = this.readCollection();
            const index = collection.findIndex((item) => item[key] === value);
            if (index !== -1) {
                collection.splice(index, 1);
                this.writeCollection(collection);
            }
        }
        catch (error) {
            throw new Error(`Failed to delete value: ${key}, ${value} ` + error);
        }
    }
    async updateMany(query, newValue) {
        const [key, value] = Object.entries(query)[0];
        try {
            const collection = this.readCollection();
            const updatedCollection = collection.map((item) => {
                if (item[key] === value) {
                    const InputValue = newValue["$set"];
                    return { ...item, ...InputValue };
                }
                return item;
            });
            this.writeCollection(updatedCollection);
            return updatedCollection;
        }
        catch (error) {
            throw new Error(`Failed to update values: ${key}, ${value} ` + error);
        }
    }
    async findOneAndUpdate(query, newValue) {
        const [key, value] = Object.entries(query)[0];
        try {
            const collection = this.readCollection();
            const index = collection.findIndex((item) => item[key] === value);
            if (index === -1) {
                throw new Error(`No entry found for key: ${key}, value: ${value}`);
            }
            const InputValue = newValue["$set"];
            collection[index] = { ...collection[index], ...InputValue };
            this.writeCollection(collection);
            return collection[index];
        }
        catch (error) {
            throw new Error(`Failed to update value: ${key}, ${value} ` + error);
        }
    }
    async findOneAndDelete(query) {
        const [key, value] = Object.entries(query)[0];
        try {
            const data = await this.findOne(query);
            if (!data) {
                throw new Error(`No entry found for key: ${key}, value: ${value}`);
            }
            await this.deleteOne(data);
            return data;
        }
        catch (error) {
            throw new Error(`Failed to find and delete value: ${key}, ${value} ` + error);
        }
    }
}
exports.default = Schema;
//# sourceMappingURL=Schema.js.map