const connection = require("../../mongo/connection")
const queries = require('../../mongo/query');
const { displayScriptStatus } = require('../../utils/displayTable');
const { getAllTheScripts } = require('./list');

async function getInstanceMigrationStatus(config) {
    try {
        await connection.connectToMongo();

        // Get the latest executed scripts
        const latestDocuments = await queries.getLatestUpdatedScripts({}, { name: 1 }, { lastUpdatedTimestampField: -1 }) || [];

        if (!latestDocuments || latestDocuments.length === 0) {
            console.log("\x1b[31mNo Migrations found in the database.\x1b[0m");
            return [];
        }

        // Extracting the names of the latest executed scripts
        const latestExecutedScriptNames = latestDocuments.map(doc => doc.name);

        const allScripts = await getAllTheScripts(config.migrationDirectory) || [];

        // Finding the last 5 scripts from the latest executed scripts
        const lastFiveScripts = latestExecutedScriptNames.slice(0, 5);

        const foundScripts = allScripts.filter(script => lastFiveScripts.includes(script.fileName));

        displayScriptStatus(foundScripts, [], true);
    } catch (error) {
        console.error("Error retrieving script status:", error);
        return [];
    } finally {
        await connection.disconnectFromMongo();
    }
}



module.exports = {
    getInstanceMigrationStatus
}