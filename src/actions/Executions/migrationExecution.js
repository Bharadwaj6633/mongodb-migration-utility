const MongoConnection = require('../../dbs/mongo/connection');
const queries = require('../../dbs/mongo/query');
const { ScriptStatusDisplay } = require('../../utils/displayTable');


class Execution {
    constructor(context) {
        this.config = context?.config;
        this.mongoConnection = new MongoConnection(context);
        this.queries = new queries(context);
        this.scriptsToExecute = context?.scriptsToExecute || [];
    }

    async executeScripts() {
        const successfullyExecuted = [];
        const failedExecutions = [];
        let client, session;

        try {
            client = await this.mongoConnection.connect();
            session = client.startSession();

            for (const script of this.scriptsToExecute) {
                await this.executeSingleScript(script, client, session, successfullyExecuted, failedExecutions);
            }

            this.displayResults(successfullyExecuted, failedExecutions);
        } catch (error) {
            console.error('Error executing scripts:', error);
            throw error;
        } finally {
            if (session) await session.endSession();
            if (client) await this.mongoConnection.disconnect();
        }
    }

    async executeSingleScript(script, client, session, successfullyExecuted, failedExecutions) {
        const scriptFilePath = script?.filePath;
        const MigrationExecutor = require(scriptFilePath);
        const migrationExecutor = new MigrationExecutor(client, session);

        try {
            await migrationExecutor.executeScript();
            successfullyExecuted.push(script);
            await this.updateExecutionDetails(script);
        } catch (error) {
            console.error(`Error executing script ${script.fileName}:`, error);
            failedExecutions.push(script);
        }
    }

    async updateExecutionDetails(script) {
        this.queries.mongoConnection = this.mongoConnection;
        // Retrieve the current script details from the database
        const existingScript = await this.queries.findScriptByName(script?.fileName);
        const currentNoOfTimesExecuted = existingScript?.noOfTimesExecuted || 0;

        const executionDetails = {
            timeOfExecution: new Date(),
            name: script?.fileName,
            folderName: script?.folderName,
            noOfTimesExecuted: currentNoOfTimesExecuted + 1  // Increment the count
        };
        const result = await this.queries.updateScript(executionDetails.name,
            {
                timeOfExecution: executionDetails.timeOfExecution,
                name: executionDetails.name,
                noOfTimesExecuted: executionDetails.noOfTimesExecuted,
                folderName: executionDetails.folderName
            }
        );
    }

    displayResults(successfullyExecuted, failedExecutions) {
        const scriptStatusDisplay = new ScriptStatusDisplay();
        scriptStatusDisplay.displayExecutedScripts(successfullyExecuted);

        if (failedExecutions.length > 0) {
            console.log('Failed Executions:');
            scriptStatusDisplay.displayScriptExecutionStatus(failedExecutions, this.scriptsToExecute);
        }
    }
}

module.exports = Execution;
