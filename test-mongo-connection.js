const { MongoClient } = require('mongodb');

// Test MongoDB connection specifically for Railway deployment
async function testMongoConnection() {
    console.log('🔍 Testing MongoDB Atlas connection for Railway...');
    
    // Use the exact connection string from Railway environment
    const uri = process.env.MONGODB_URI || 'mongodb+srv://datatableuser:!areyoucrazy12@cluster0.yslqyef.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('📡 Connection URI format check:');
    console.log(`   Protocol: ${uri.startsWith('mongodb+srv://') ? '✅ SRV' : '❌ Invalid'}`);
    console.log(`   Has credentials: ${uri.includes('@') ? '✅ Yes' : '❌ No'}`);
    console.log(`   URI length: ${uri.length} characters`);
    
    let client;
    try {
        console.log('\n🔌 Attempting connection to MongoDB Atlas...');
        
        client = new MongoClient(uri, {
            serverSelectionTimeoutMS: 30000, // 30 second timeout
            connectTimeoutMS: 30000,
            socketTimeoutMS: 30000,
        });
        
        console.log('📞 Connecting...');
        await client.connect();
        
        console.log('✅ Connected to MongoDB Atlas!');
        
        // Test database access
        const db = client.db('stomp_server');
        console.log('📊 Testing database access...');
        
        // Test collections
        const collections = await db.listCollections().toArray();
        console.log(`📁 Found ${collections.length} collections:`);
        collections.forEach(col => console.log(`   - ${col.name}`));
        
        // Test data access
        const positionsCollection = db.collection('positions');
        const tradesCollection = db.collection('trades');
        
        const posCount = await positionsCollection.countDocuments();
        const tradeCount = await tradesCollection.countDocuments();
        
        console.log(`📈 Positions: ${posCount} records`);
        console.log(`💱 Trades: ${tradeCount} records`);
        
        console.log('\n🎉 MongoDB Atlas connection test SUCCESSFUL!');
        console.log('✅ Railway deployment should work now.');
        
    } catch (error) {
        console.error('\n❌ MongoDB Atlas connection FAILED:');
        console.error('Error:', error.message);
        
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Check MongoDB Atlas Network Access:');
        console.log('   - Go to Network Access in Atlas dashboard');
        console.log('   - Add IP Address: 0.0.0.0/0 (Allow access from anywhere)');
        console.log('');
        console.log('2. Check Database User permissions:');
        console.log('   - Go to Database Access in Atlas dashboard');
        console.log('   - Ensure user has readWriteAnyDatabase or Atlas admin role');
        console.log('');
        console.log('3. Verify connection string:');
        console.log('   - Check username/password are correct');
        console.log('   - Ensure no special characters need URL encoding');
        console.log('');
        console.log('4. Check Atlas cluster status:');
        console.log('   - Ensure cluster is running (not paused)');
        
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log('🔌 Connection closed.');
        }
    }
}

// Load environment variables
require('dotenv').config({ path: './config.env' });

testMongoConnection(); 