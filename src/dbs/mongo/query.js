class MongoQuery {
    constructor(context) {
        this.collectionName = context?.config?.databaseConfig?.collectionName;
        this.dbName = context?.config?.databaseConfig?.dbName;
        this.mongoConnection = context?.mongoConnection;
    }

    async _getCollection() {
        if (!this.mongoConnection.getClient()) {
            await this.mongoConnection.connect();
        }
        const db = this.mongoConnection.getClient().db(this.dbName);
        return db.collection(this.collectionName);
    }

    async insertDocuments(dataArray) {
        try {
            const collection = await this._getCollection();
            const result = await collection.insertMany(dataArray);
            return result.insertedIds;
        } catch (error) {
            console.error('Error inserting documents:', error);
            throw error;
        }
    }

    async getLatestUpdatedScripts(condition = {}, projection = {}, sort = { $natural: -1 }) {
        try {
            const collection = await this._getCollection();
            const query = await collection.find(condition, { projection }).sort(sort);
            return await query.toArray();
        } catch (error) {
            console.error('Error retrieving latest updated script:', error);
            throw error;
        }
    }

    async deleteDocument(condition) {
        try {
            const collection = await this._getCollection();
            const result = await collection.deleteOne(condition);
            return result.deletedCount;
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }

    async updateScriptsStatus(condition, updateData, options = {}) {
        try {
            const collection = await this._getCollection();
            const result = await collection.updateOne(condition, { $set: updateData }, options);
            return result.modifiedCount;
        } catch (error) {
            console.error('Error updating scripts status:', error);
            throw error;
        }
    }

    async findScriptByName(name) {
        try {
            const collection = await this._getCollection();
            return await collection.findOne({ name });
        } catch (error) {
            console.error('Error finding script by name:', error);
            throw error;
        }
    }

    async updateScript(scriptName, updateData) {
        try {
            const collection = await this._getCollection();
            const result = await collection.updateOne(
                { name: scriptName }, 
                { $set: updateData }, 
                { upsert: true }  // Enable upsert
            );
            return result.modifiedCount || result.upsertedCount;
        } catch (error) {
            console.error('Error updating or inserting script:', error);
            throw error;
        }
    }

}

module.exports = MongoQuery;
