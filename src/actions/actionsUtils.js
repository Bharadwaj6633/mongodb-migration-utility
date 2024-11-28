const path = require('path');

class ScriptPathManager {
    constructor(context ) {
        this.config = context.config;
    }

    getScriptPaths(scripts) {
        return scripts.map(script => {
            const filePath = path.join(this.config.migrationDirectory, script);
            return {
                fileName: script,
                filePath: filePath,
                folderName: path.basename(this.config.migrationDirectory)
            };
        });
    }
}

module.exports = ScriptPathManager;
