// actions/index.js
const createMigration = require('./Creation/createFile.js');
const listMigrations = require('./Manage/list.js');
const migrationExecution = require('./Executions/migrationExecution.js');


class ActionRegistry {
  constructor(context) {
    if (!context || !context.config) {
      throw new Error('Configuration is missing.');
    }
    this.createMigration = new createMigration(context);
    this.listMigrations = new listMigrations(context);
    this.migrationExecution = new migrationExecution(context);
  }
}

module.exports = ActionRegistry;
