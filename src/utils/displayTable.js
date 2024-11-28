const Table = require('cli-table3');

class ScriptStatusDisplay {
  constructor() {
    this.table = new Table({
      head: ['\x1b[38;5;226mFolder Name\x1b[0m', '\x1b[38;5;226mScript Name\x1b[0m', '\x1b[38;5;226mStatus\x1b[0m'], // Yellow color for header
      colWidths: ['auto', 'auto', 40]
    });
  }

  display(executedScripts, scriptFiles = [], executedNow = false) {
    this.table.length = 0; // Clear the table before displaying new data

    if (executedNow) {
      this.displayExecutedScripts(executedScripts);
    } else if (!scriptFiles.length || !executedScripts) {
      this.displayNoScriptsFound();
    } else {
      this.displayScriptExecutionStatus(executedScripts, scriptFiles);
    }

    console.log(this.table.toString());
  }

  displayExecutedScripts(executedScripts) {
    executedScripts.forEach(script => {
      this.table.push([
        '\x1b[32m' + (script?.folderName || '') + '\x1b[0m',
        '\x1b[32m' + (script?.fileName || script?.name) + '\x1b[0m',
        '\x1b[32mSuccessfully Executed\x1b[0m'
      ]);
    });

    console.log(this.table.toString());// Green color for the final success message
  }

  displayNoScriptsFound() {
    this.table.push(['\x1b[31mNo scripts found\x1b[0m', '', '']); // Red color for message
  }

  displayScriptExecutionStatus(executedScripts, scriptFiles) {
    scriptFiles.forEach(script => {
      const isExecuted = executedScripts.some(executedScript => executedScript.name === script.fileName);
      this.table.push([
        isExecuted ? '\x1b[32m' + (script.folderName || '') + '\x1b[0m' : '\x1b[91m' + (script.folderName || '') + '\x1b[0m',
        isExecuted ? '\x1b[32m' + script.fileName + '\x1b[0m' : '\x1b[91m' + script.fileName + '\x1b[0m',
        isExecuted ? '\x1b[32mSuccessfully Executed\x1b[0m' : '\x1b[91mNot Executed\x1b[0m'
      ]);
    });

    console.log(this.table.toString());

    if (scriptFiles.length === executedScripts.length) {
      console.log('\x1b[32mAll scripts executed successfully\x1b[0m');
    }
  }
}

module.exports = { ScriptStatusDisplay };
