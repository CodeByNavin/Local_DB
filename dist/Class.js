"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const Schema_1 = __importDefault(require("./Schema"));
class LocalDB {
    constructor(DB_File) {
        this.Schema = Schema_1.default;
        this.DB_File = DB_File;
    }
    readData() {
        try {
            const data = (0, fs_1.readFileSync)(this.DB_File, 'utf8');
            return JSON.parse(data);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('ENOENT')) {
                return {};
            }
            throw new Error(`Failed to read JSON file: ${error}`);
        }
    }
    writeData(data) {
        try {
            const JSONString = JSON.stringify(data, null, 2);
            (0, fs_1.writeFileSync)(this.DB_File, JSONString, 'utf8');
        }
        catch (error) {
            throw new Error(`Failed to write JSON file: ${error}`);
        }
    }
    // Public getters to allow Schema access without exposing private methods directly
    getData() {
        return this.readData();
    }
    setData(data) {
        this.writeData(data);
    }
}
exports.default = LocalDB;
//# sourceMappingURL=Class.js.map