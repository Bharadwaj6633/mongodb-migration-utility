const fs = require('fs');
const path = require('path');

class MigrationFileCreator {
  constructor(context) {
    if (!context || !context.config || !context.config.migrationDirectory) {
      throw new Error('Configuration or migration folder path is missing.');
    }
    this.fileName = context.fileName;
    this.basePath = context.config.migrationDirectory;
    this.mongoTemplatePath = path.join(__dirname, '..', '..', 'migartionTemplates', 'mongoTemplate.js');
  }

  async createFile() {
    try {
      if (!this.basePath) {
        throw new Error('Please set a valid configuration for the migrationDirectory.');
      }

      if (!this.fileName) {
        throw new Error('Migration file name not specified.');
      }

      // Check for duplicate files
      const files = await fs.promises.readdir(this.basePath);
      const duplicateFile = files.find(file => file.endsWith(`-${this.fileName}.js`));
      if (duplicateFile) {
        throw new Error(`A migration file with the name "${this.fileName}" already exists.`);
        return;
      }

      const epochTime = Date.now();
      const uniqueFileName = `${epochTime}-${this.fileName}.js`;

      const filePath = path.join(this.basePath, uniqueFileName);

      await this.ifExists(this.basePath);

      const fileContent = await fs.promises.readFile(this.mongoTemplatePath, 'utf-8');

      await fs.promises.writeFile(filePath, fileContent);

      // Log success message
      console.log(`File ${uniqueFileName} created successfully at ${this.basePath}`);

      // Return the unique file name
      return uniqueFileName;
    } catch (error) {
      console.error(`Error creating migration file: ${error.message}`);
    }
  }

  async ifExists(directoryPath) {
    try {
      await fs.promises.access(directoryPath, fs.constants.W_OK);
    } catch (error) {
      throw new Error(`Directory does not exist or is not writable: ${directoryPath}`);
    }
  }
}

module.exports = MigrationFileCreator;
