class MigrationExecutor {
  constructor(client) {
    this.client = client;
  }

  async executeScript() {
    try {
      /* *********************************** Write your migration below ************************************************** */



      /* **************************************** End of migration ******************************************************* */
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MigrationExecutor;
