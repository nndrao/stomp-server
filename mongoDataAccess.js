const { MongoClient } = require('mongodb');

// Load environment variables from config.env or Railway environment
require('dotenv').config({ path: './config.env' });

class MongoDataAccess {
    constructor() {
        this.client = null;
        this.db = null;
        this.isConnected = false;
    }

    async connect() {
        if (this.isConnected) {
            return;
        }

        try {
            console.log('🔌 Connecting to MongoDB Atlas...');
            this.client = new MongoClient(process.env.MONGODB_URI);
            await this.client.connect();
            this.db = this.client.db(process.env.DATABASE_NAME);
            this.isConnected = true;
            console.log('✅ Connected to MongoDB Atlas');
        } catch (error) {
            console.error('❌ Failed to connect to MongoDB:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.client && this.isConnected) {
            await this.client.close();
            this.isConnected = false;
            console.log('🔌 MongoDB connection closed');
        }
    }

    async getAllPositions() {
        await this.connect();
        const collection = this.db.collection(process.env.POSITIONS_COLLECTION);
        return await collection.find({}).toArray();
    }

    async getAllTrades() {
        await this.connect();
        const collection = this.db.collection(process.env.TRADES_COLLECTION);
        return await collection.find({}).toArray();
    }

    async getPositionById(positionId) {
        await this.connect();
        const collection = this.db.collection(process.env.POSITIONS_COLLECTION);
        return await collection.findOne({ positionId });
    }

    async getTradeById(tradeId) {
        await this.connect();
        const collection = this.db.collection(process.env.TRADES_COLLECTION);
        return await collection.findOne({ tradeId });
    }

    async getPositionsByFilter(filter = {}) {
        await this.connect();
        const collection = this.db.collection(process.env.POSITIONS_COLLECTION);
        return await collection.find(filter).toArray();
    }

    async getTradesByFilter(filter = {}) {
        await this.connect();
        const collection = this.db.collection(process.env.TRADES_COLLECTION);
        return await collection.find(filter).toArray();
    }

    async getPositionsByDesk(desk) {
        return await this.getPositionsByFilter({ desk });
    }

    async getPositionsByTrader(trader) {
        return await this.getPositionsByFilter({ trader });
    }

    async getTradesByTrader(trader) {
        return await this.getTradesByFilter({ trader });
    }

    async getTradesByStatus(status) {
        return await this.getTradesByFilter({ status });
    }

    async getPositionsByInstrumentType(instrumentType) {
        return await this.getPositionsByFilter({ instrumentType });
    }

    async getTradesByDateRange(startDate, endDate) {
        return await this.getTradesByFilter({
            tradeDate: {
                $gte: startDate,
                $lte: endDate
            }
        });
    }

    async getPositionsCount() {
        await this.connect();
        const collection = this.db.collection(process.env.POSITIONS_COLLECTION);
        return await collection.countDocuments();
    }

    async getTradesCount() {
        await this.connect();
        const collection = this.db.collection(process.env.TRADES_COLLECTION);
        return await collection.countDocuments();
    }

    async getRandomPositions(count = 10) {
        await this.connect();
        const collection = this.db.collection(process.env.POSITIONS_COLLECTION);
        return await collection.aggregate([
            { $sample: { size: count } }
        ]).toArray();
    }

    async getRandomTrades(count = 10) {
        await this.connect();
        const collection = this.db.collection(process.env.TRADES_COLLECTION);
        return await collection.aggregate([
            { $sample: { size: count } }
        ]).toArray();
    }

    async getPositionsPaginated(page = 1, limit = 100) {
        await this.connect();
        const collection = this.db.collection(process.env.POSITIONS_COLLECTION);
        const skip = (page - 1) * limit;
        return await collection.find({}).skip(skip).limit(limit).toArray();
    }

    async getTradesPaginated(page = 1, limit = 100) {
        await this.connect();
        const collection = this.db.collection(process.env.TRADES_COLLECTION);
        const skip = (page - 1) * limit;
        return await collection.find({}).skip(skip).limit(limit).toArray();
    }

    // Update position (for live updates)
    async updatePosition(positionId, updateData) {
        await this.connect();
        const collection = this.db.collection(process.env.POSITIONS_COLLECTION);
        return await collection.updateOne(
            { positionId },
            { $set: updateData }
        );
    }

    // Update trade (for live updates)
    async updateTrade(tradeId, updateData) {
        await this.connect();
        const collection = this.db.collection(process.env.TRADES_COLLECTION);
        return await collection.updateOne(
            { tradeId },
            { $set: updateData }
        );
    }

    // Bulk update positions
    async bulkUpdatePositions(updates) {
        await this.connect();
        const collection = this.db.collection(process.env.POSITIONS_COLLECTION);
        const bulkOps = updates.map(update => ({
            updateOne: {
                filter: { positionId: update.positionId },
                update: { $set: update.data }
            }
        }));
        return await collection.bulkWrite(bulkOps);
    }

    // Bulk update trades
    async bulkUpdateTrades(updates) {
        await this.connect();
        const collection = this.db.collection(process.env.TRADES_COLLECTION);
        const bulkOps = updates.map(update => ({
            updateOne: {
                filter: { tradeId: update.tradeId },
                update: { $set: update.data }
            }
        }));
        return await collection.bulkWrite(bulkOps);
    }
}

// Export singleton instance
const mongoDataAccess = new MongoDataAccess();

module.exports = mongoDataAccess; 