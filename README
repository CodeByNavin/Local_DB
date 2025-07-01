# LocalDB Example

A local version of MongoDB in a JSON file, with similar features to Mongoose.

## Overview

This project demonstrates how to use `@codebynavin/local_db`, a lightweight local database that mimics Mongoose and MongoDB functionality using a JSON file as storage. It's perfect for small-scale apps, local development, and quick prototyping without requiring a full database server.

## Features

- Define schemas similar to Mongoose
- Local JSON file storage

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- `@codebynavin/local_db` npm package

Install the `@codebynavin/local_db` package:

```bash
npm install @codebynavin/local_db
```

# Usage
Here’s a simple example of how to define a schema, insert a user, and update a record:
```js
const { LocalDB } = require("local_db");

// Initialize the db with the JSON file name
const db = new LocalDB("db.json");

async function main() {
    try {
        // Define a schema
        const userSchema = new db.Schema(db, "users", {
            name: String,
            age: Number
        });

        // Create the new user
        userSchema.create({ name: "John", age: 30 });
        
        // Find and log all users with age: 30
        const user = await userSchema.find({ age: 30 });
        console.log(user);
    } catch (error) {
        console.error("Error:", error);
    }
}

main()
```

### Output: [{ name: 'John', age: 30 }]
