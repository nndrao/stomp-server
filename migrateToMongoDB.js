const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './config.env' });

async function migrateToMongoDB() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        await client.connect();
        console.log('✅ Connected to MongoDB Atlas');
        
        const db = client.db(process.env.DATABASE_NAME);
        
        // Load and migrate positions data
        console.log('📊 Loading positions data...');
        const positionsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'positions.json'), 'utf-8'));
        console.log(`📊 Found ${positionsData.length} positions to migrate`);
        
        const positionsCollection = db.collection(process.env.POSITIONS_COLLECTION);
        
        // Clear existing data if any
        await positionsCollection.deleteMany({});
        console.log('🗑️ Cleared existing positions data');
        
        // Insert in batches to handle large datasets
        const batchSize = 1000;
        for (let i = 0; i < positionsData.length; i += batchSize) {
            const batch = positionsData.slice(i, i + batchSize);
            await positionsCollection.insertMany(batch);
            console.log(`📊 Inserted positions batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(positionsData.length / batchSize)}`);
        }
        
        // Create indexes for better query performance
        await positionsCollection.createIndex({ positionId: 1 }, { unique: true });
        await positionsCollection.createIndex({ cusip: 1 });
        await positionsCollection.createIndex({ trader: 1 });
        await positionsCollection.createIndex({ desk: 1 });
        await positionsCollection.createIndex({ instrumentType: 1 });
        console.log('🔍 Created indexes for positions collection');
        
        // Load and migrate trades data
        console.log('💼 Loading trades data...');
        const tradesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'trades.json'), 'utf-8'));
        console.log(`💼 Found ${tradesData.length} trades to migrate`);
        
        const tradesCollection = db.collection(process.env.TRADES_COLLECTION);
        
        // Clear existing data if any
        await tradesCollection.deleteMany({});
        console.log('🗑️ Cleared existing trades data');
        
        // Insert in batches
        for (let i = 0; i < tradesData.length; i += batchSize) {
            const batch = tradesData.slice(i, i + batchSize);
            await tradesCollection.insertMany(batch);
            console.log(`💼 Inserted trades batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(tradesData.length / batchSize)}`);
        }
        
        // Create indexes for trades
        await tradesCollection.createIndex({ tradeId: 1 }, { unique: true });
        await tradesCollection.createIndex({ cusip: 1 });
        await tradesCollection.createIndex({ trader: 1 });
        await tradesCollection.createIndex({ tradeDate: 1 });
        await tradesCollection.createIndex({ side: 1 });
        await tradesCollection.createIndex({ status: 1 });
        console.log('🔍 Created indexes for trades collection');
        
        console.log('✅ Migration completed successfully!');
        console.log(`📊 Total positions migrated: ${positionsData.length}`);
        console.log(`💼 Total trades migrated: ${tradesData.length}`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('🔌 MongoDB connection closed');
    }
}

// Run migration if this script is executed directly
if (require.main === module) {
    migrateToMongoDB().catch(console.error);
}

module.exports = { migrateToMongoDB }; 