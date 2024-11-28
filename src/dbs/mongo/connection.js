const { MongoClient } = require('mongodb');

class MongoConnection {
    constructor(context = {}) {
        this.mongoURI = context?.config?.databaseConfig?.uri;
        this.options = context?.config?.databaseConfig?.options;
        this.client = null;
    }

    async connect() {
        try {
            if (!this.client) {
                this.client = await MongoClient.connect(this.mongoURI, this.options);
                console.log('Connected to MongoDB');
            }
            return this.client;
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }

    getClient() {
        return this.client;
    }

    async disconnect() {
        try {
            if (this.client) {
                await this.client.close();
                console.log('Disconnected from MongoDB');
                this.client = null;
            }
        } catch (error) {
            console.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }
}

module.exports = MongoConnection;
