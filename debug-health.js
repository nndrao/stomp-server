const http = require('http');
const mongoDataAccess = require('./mongoDataAccess');

async function testHealthCheck() {
    console.log('🔍 Testing health check components...');
    
    try {
        // Test 1: Environment variables
        console.log('\n1. Environment Variables:');
        console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? 'SET' : 'NOT SET'}`);
        console.log(`   DATABASE_NAME: ${process.env.DATABASE_NAME || 'NOT SET'}`);
        console.log(`   POSITIONS_COLLECTION: ${process.env.POSITIONS_COLLECTION || 'NOT SET'}`);
        console.log(`   TRADES_COLLECTION: ${process.env.TRADES_COLLECTION || 'NOT SET'}`);
        console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
        console.log(`   PORT: ${process.env.PORT || 'NOT SET'}`);

        // Test 2: MongoDB connection
        console.log('\n2. Testing MongoDB connection...');
        const positionsCount = await mongoDataAccess.getPositionsCount();
        const tradesCount = await mongoDataAccess.getTradesCount();
        console.log(`   ✅ MongoDB connected successfully`);
        console.log(`   📊 Positions count: ${positionsCount}`);
        console.log(`   📊 Trades count: ${tradesCount}`);

        // Test 3: Health check endpoint simulation
        console.log('\n3. Health check endpoint would return:');
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'connected',
            memory: process.memoryUsage(),
            environment: process.env.NODE_ENV || 'development',
            positionsCount: positionsCount,
            tradesCount: tradesCount,
            mongodbConnected: true
        };
        console.log(JSON.stringify(healthStatus, null, 2));

        console.log('\n✅ All health check components are working correctly!');
        console.log('🚀 Your application should deploy successfully on Railway.');

    } catch (error) {
        console.error('\n❌ Health check failed:');
        console.error('Error:', error.message);
        console.error('\n🔧 Troubleshooting steps:');
        console.error('1. Check your environment variables in Railway dashboard');
        console.error('2. Ensure MongoDB Atlas allows connections from 0.0.0.0/0');
        console.error('3. Verify your MongoDB connection string is correct');
        console.error('4. Make sure you have run: npm run migrate-to-mongodb');
        
        process.exit(1);
    }
}

// Run the test
testHealthCheck(); 