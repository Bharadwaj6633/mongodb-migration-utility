// list.js
const fs = require('fs').promises;
const path = require('path');
const MongoQuery = require('../../dbs/mongo/query');
const MongoConnection = require('../../dbs/mongo/connection');
const { ScriptStatusDisplay } = require('../../utils/displayTable');

class ScriptManager {
  constructor(context) {
    if (!context || !context.config) {
      throw new Error('Configuration is missing.');
    }
    this.config = context.config;
    this.migrationDirectory = context.config?.migrationDirectory;
    this.executionType = context.type || 'default';
    this.getTypeOfScript = context.getTypeOfScript || 'notExecuted';
    this.mongoConnection = new MongoConnection(context);
    this.queries = new MongoQuery(context);
  }

  /* retrieves the list of scripts */
  async retrieveScriptList() {
    await this.mongoConnection.connect();
    let executedScripts = await this.fetchExecutedScripts();
    let allScripts = await this.fetchAllScripts();
    const unexecutedScripts = [];

    if (this.executionType === 'custom') {
      const { regexPatterns = [], runAll = false } = this.config?.migrationTypes?.custom || {};
      if (runAll) executedScripts = [];
      allScripts = await this.filterScriptsByPattern(allScripts, regexPatterns, runAll);
    }

    const executedScriptNames = new Set(executedScripts.map(script => script.name));

    for (const script of allScripts) {
      if (!executedScriptNames.has(script.fileName)) {
        unexecutedScripts.push(script);
      }
    }

    const scriptStatusDisplay = new ScriptStatusDisplay();
    if (this.getTypeOfScript === 'notExecuted') {
      await scriptStatusDisplay.displayScriptExecutionStatus(executedScripts, unexecutedScripts);
    } else if (this.getTypeOfScript === 'executed') {
      await scriptStatusDisplay.displayExecutedScripts(executedScripts, []);
    }

    try {
      return { unexecutedScripts, executedScripts };
    } finally {
      await this.mongoConnection.disconnect();
    }
  }

  /* fetches the executed scripts from the database */
  async fetchExecutedScripts() {
    try {
      this.queries.mongoConnection = this.mongoConnection;
      const projection = { name: 1, folderName: 1 };
      const totalScripts = await this.queries.getLatestUpdatedScripts({}, projection);
      return totalScripts || [];
    } catch (error) {
      console.error("Error retrieving script status:", error);
      return [];
    }
  }

  /* fetches all the scripts from the migration directory */
  async fetchAllScripts(basePath = this.migrationDirectory) {
    const scripts = [];
    try {
      const files = await fs.readdir(basePath);
      for (const file of files) {
        const filePath = path.join(basePath, file);
        const fileStat = await fs.stat(filePath);
        if (fileStat.isDirectory()) {
          scripts.push(...await this.fetchAllScripts(filePath));
        } else if (file.endsWith('.js')) {
          const folderName = path.basename(path.dirname(filePath));
          const fileName = path.basename(file);
          const scriptInfo = { fileName, filePath, folderName };
          scripts.push(scriptInfo);
        }
      }
    } catch (error) {
      console.error("Error reading directory:", error);
    }
    return scripts;
  }

  async filterScriptsByPattern(scripts, patterns, runAll) {
    const filteredScripts = [];
    const patternMap = new Map();

    for (const script of scripts) {
      for (const pattern of patterns) {
        if (new RegExp(pattern, 'i').test(script.fileName)) {
          const epochTime = parseInt(script.fileName.split('-')[0]);
          const existingScript = patternMap.get(pattern);
          if (!existingScript || (!runAll && epochTime > parseInt(existingScript.fileName.split('-')[0]))) {
            patternMap.set(pattern, script);
          } else if (runAll) {
            filteredScripts.push(script);
          }
          break;
        }
      }
    }

    for (const [pattern, script] of patternMap.entries()) {
      filteredScripts.push(script);
    }

    return filteredScripts;
  }
}

module.exports = ScriptManager;
