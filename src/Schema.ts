import LocalDB from './Class';
import crypto from "crypto";

interface ExtraInputs {
    upsert?: boolean;
    new?: boolean;
    timestamps?: boolean;
}

export default class Schema {
    private collectionName: string;
    private schemaDefinition: { [key: string]: any };
    private db: LocalDB;
    private ExtraInputs = {
        upsert: Boolean,
        new: Boolean,
        timestamps: Boolean
    }

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

    private checkExtraInput(
        inputs: ExtraInputs,
        MainData: { [key: string]: any },
        system: "create" | "update" | "delete" | "find"
    ) {
        for (const [key, value] of Object.entries(inputs)) {
            if (this.ExtraInputs[key as keyof typeof this.ExtraInputs] === undefined) {
                throw new Error(`Invalid extra input: ${key}`);
            }
            if (
                typeof value !== "boolean" &&
                value !== true
            ) continue;

            // TODO: Add on upsert and new logic

            switch (system) {
                case "create":
                    if (key === "timestamps") {
                        MainData.createdAt = new Date().toISOString();
                        MainData.updatedAt = new Date().toISOString();
                    }
                    break;
                case "update":
                    if (key === "timestamps") {
                        MainData.updatedAt = new Date().toISOString();
                    }
                    break;
                case "delete":
                    if (key === "timestamps") {
                        delete MainData.createdAt;
                        delete MainData.updatedAt;
                    }
                    break;
                case "find":
                    if (key === "upsert") {
                        const existingItem = this.readCollection().find((item: any) => item._id === MainData._id);
                        if (!existingItem) {
                            this.create(MainData);
                        }
                    }
                    break;
                default:
                    throw new Error(`Invalid system operation: ${system}`);
                    break;
            }
        }
        return MainData;
    }

    public async create(query: { [key: string]: any }, extraInputs?: ExtraInputs) {
        try {
            this.validateDocument(query);
            const _id = crypto.randomBytes(24).toString('hex');
            query._id = _id;
            const collection = this.readCollection();
            extraInputs ? query = this.checkExtraInput(extraInputs, query, "create") : null;
            collection.push(query);
            this.writeCollection(collection);
            return query;
        } catch (error) {
            throw new Error(`Failed to create entry: ` + error);
        }
    }

    public async find(query?: { [key: string]: any }, extraInputs?: ExtraInputs) {
        try {
            const collection = this.readCollection();
            if (!query) {
                if (extraInputs) {
                    return collection.map((item: any) => this.checkExtraInput(extraInputs, item, "find"));
                }
                return collection;
            } else {
                const [key, value] = Object.entries(query)[0];
                if (extraInputs) {
                    return collection
                        .filter((item: any) => item[key] === value)
                        .map((item: any) => this.checkExtraInput(extraInputs, item, "find"));
                }
                return collection.filter((item: any) => item[key] === value);
            }
        } catch (error) {
            throw new Error(`Failed to find value ` + error);
        }
    }

    public async findOne(query: { [key: string]: any }, extraInputs?: ExtraInputs) {
        const [key, value] = Object.entries(query)[0];
        try {
            const collection = this.readCollection();
            let item = collection.find((item: any) => item[key] === value);
            if (extraInputs && item) {
                item = this.checkExtraInput(extraInputs, item, "find");
            }
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

    public async updateMany(query: { [key: string]: any }, newValue: { "$set": { [key: string]: any } }, extraInputs?: ExtraInputs) {
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
            if (extraInputs) {
                updatedCollection.forEach((item: any) => {
                    this.checkExtraInput(extraInputs, item, "update");
                });
            }
            this.writeCollection(updatedCollection);
            return updatedCollection;
        } catch (error) {
            throw new Error(`Failed to update values: ${key}, ${value} ` + error);
        }
    }

    public async findById(
        _id: string,
        extraInputs?: ExtraInputs
    ) {
        try {
            const collection = this.readCollection();
            let item = collection.find((item: any) => item._id === _id);
            if (extraInputs && item) {
                item = this.checkExtraInput(extraInputs, item, "find");
            }
            return item || null;
        } catch (error) {
            throw new Error(`Failed to find value with _id: ${_id} ` + error);
        }
    }

    public async findByIdAndUpdate(
        _id: string,
        newValue: { "$set": { [key: string]: any } },
        extraInputs?: ExtraInputs
    ) {
        try {
            const collection = this.readCollection();
            const index = collection.findIndex((item: any) => item._id === _id);
            if (index === -1) {
                throw new Error(`No entry found for _id: ${_id}`);
            }
            const InputValue = newValue["$set"];
            collection[index] = { ...collection[index], ...InputValue };
            if (extraInputs) {
                collection[index] = this.checkExtraInput(extraInputs, collection[index], "update");
            }
            this.writeCollection(collection);
            return collection[index];
        } catch (error) {
            throw new Error(`Failed to update value with _id: ${_id} ` + error);
        }
    }

    public async findOneAndUpdate(
        query: { [key: string]: any },
        newValue: { "$set": { [key: string]: any } },
        extraInputs?: ExtraInputs
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
            if (extraInputs) {
                collection[index] = this.checkExtraInput(extraInputs, collection[index], "update");
            }
            this.writeCollection(collection);
            return collection[index];
        } catch (error) {
            throw new Error(`Failed to update value: ${key}, ${value} ` + error);
        }
    }

    public async findByIdAndDelete(
        _id: string,
    ) {
        try {
            const collection = this.readCollection();
            const index = collection.findIndex((item: any) => item._id === _id);
            if (index === -1) {
                throw new Error(`No entry found for _id: ${_id}`);
            }
            const removedItem = collection[index];
            collection.splice(index, 1);
            this.writeCollection(collection);
            return removedItem;
        } catch (error) {
            throw new Error(`Failed to remove value with _id: ${_id} ` + error);
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