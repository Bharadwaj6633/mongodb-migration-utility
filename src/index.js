#!/usr/bin/env node
const { Command } = require('commander');
const path = require('path');
const ActionRegistry = require('./actions/actionRegistry.js');
const ValidationsUtils = require('./utils/validationUtils.js');
const utils = require('./actions/actionsUtils');

class MigrationUtility {
  constructor() {
    this.rootDir = process.cwd();
    const migrateConfigPath = path.resolve(this.rootDir, "..", 'migrate.config.js');
    this.config = require(migrateConfigPath);
    this.context = { config: this.config };
    this.validationUtils = new ValidationsUtils(this.config);
    this.actionRegistry = new ActionRegistry(this.context);
    this.setupProgram();
  }

  setupProgram() {
    const program = new Command();
    program.version('1.0.0').description('MongoDB Migration Utility')
    program
      .command('create <fileName>')
      .description('Create a folder or file name for migration')
      .action(this.createMigration.bind(this));

    program
      .command('list')
      .description('List of all migration scripts that are not executed')
      .action(this.listMigrations.bind(this));

    program
      .command('script <scriptName>')
      .description('Execute a single migration script')
      .action(this.executeSpecificScripts.bind(this));

    program
      .command('execute')
      .description('Execute all unexecuted migration scripts')
      .action(this.executeMigrations.bind(this));

    program
      .command('status')
      .description('Scripts that are executed')
      .action(this.migrationStatus.bind(this));

    program.parse(process.argv);
  }

  /* creates a migration file */
  async createMigration(fileName) {
    const trimmedFileName = fileName.trim();
    try {
      await this.validationUtils.validateCreateMigration(trimmedFileName);
      this.actionRegistry.createMigration.fileName = trimmedFileName;
      await this.actionRegistry.createMigration.createFile();
    } catch (err) {
      console.error('Error: Unable to create file', err);
    } finally {
      process.exit();
    }
  }

  /* lists the migration scripts */
  async listMigrations() {
    await this.validationUtils.validateConfig();
    try {
      await this.actionRegistry.listMigrations.retrieveScriptList();
    } catch (err) {
      console.error('Error: Unable to retrieve script list', err);
    } finally {
      process.exit();
    }
  }

  /* executes a specific script */
  async executeSpecificScripts(scriptName) {
    await this.validationUtils.validateConfig();
    const scriptNames = scriptName.split(/\s+/).filter(name => name.trim().length);
    if (scriptNames.length) {
      this.utils = new utils(this.context);
      this.actionRegistry.migrationExecution.scriptsToExecute = this.utils.getScriptPaths(scriptNames);
      await this.actionRegistry.migrationExecution.executeScripts();
    } else {
      console.log('Error: ScriptName is required');
    }
    process.exit();
  }

  /* executes all unexecuted scripts */
  async executeMigrations() {
    await this.validationUtils.validateConfig();
    const { unexecutedScripts } = await this.actionRegistry.listMigrations.retrieveScriptList();
    try {
      if (unexecutedScripts.length > 0) {
        this.actionRegistry.migrationExecution.scriptsToExecute = unexecutedScripts;
        await this.actionRegistry.migrationExecution.executeScripts();
      } else {
        console.log('No unexecuted scripts found.');
      }
    } catch (err) {
      console.error('Error: Unable to execute migrations', err);
    } finally {
      process.exit();
    }
  }

  /* gets the excuted scripts list status of all the scripts */
  async migrationStatus() {
    await this.validationUtils.validateConfig();
    this.actionRegistry.listMigrations.getTypeOfScript = 'executed';
    try {
      await this.actionRegistry.listMigrations.retrieveScriptList();
    } catch (err) {
      console.error('Error: Unable to retrieve script list', err);
    } finally {
      process.exit();
    }
  }
}

new MigrationUtility();

