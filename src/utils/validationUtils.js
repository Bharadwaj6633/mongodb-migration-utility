class ValidationsUtils {

    constructor(config) {
        this.config = config;
    }

    async validateCreateMigration(fileName) {
        await this.validateConfig();
        if (!this.config?.migrationDirectory) {
            throw new Error('Migration folder is not defined in the configuration');
        }
        if (!fileName) {
            throw new Error('File name is required');
        }
    }


    async validateConfig() {
        if (!this.config) {
            throw new Error('Configuration is not defined');
        }
    }

}

module.exports = ValidationsUtils;
