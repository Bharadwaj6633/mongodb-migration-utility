# MongoDB Migration Utility

This utility is designed to help manage MongoDB database migrations. It provides a command-line interface to create, list, execute, and check the status of migration scripts.

## Installation

To install the utility, use npm:

```bash
npm install mongodb-migration-utility
```

## Usage

After installation, you can use the `migrate` command to manage your migrations:

### Create a Migration

To create a new migration script, use the following command:

```bash
migrate create <fileName>
```

### List Migrations

To list all migration scripts that have not been executed, use:

```bash
migrate list
```

### Execute a Specific Script

To execute a specific migration script, use:

```bash
migrate script <scriptName>
```

### Execute All Unexecuted Scripts

To execute all unexecuted migration scripts, use:

```bash
migrate execute
```

### Check Migration Status

To check the status of executed scripts, use:

```bash
migrate status
```

## Configuration

Ensure your `migrate.config.js` file is correctly configured with your MongoDB connection details and directories for migrations.

Create a `migrate.config.js` file in the root of your project with the following structure:

```javascript
module.exports = {
    migrationDirectory: '/path/to/your/migration/directory',
    databaseConfig: {
        uri: 'mongodb://localhost:27017',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
        dbName: "your-database-name",
        collectionName: "migrations"
    }
}
```

Replace the placeholders with your actual MongoDB connection details and the path to your migration directory.

## Contributing

If you wish to contribute to this project, please fork the repository and submit a pull request.

## License

This project is licensed under the ISC License.