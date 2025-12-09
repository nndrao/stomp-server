const Stomp = require('stompjs');
Object.assign(global, { WebSocket: require('ws') });

// Test enhanced client-specific functionality
async function testEnhancedFeatures() {
    console.log('🚀 Testing Enhanced STOMP Client Features...\n');
    
    // Create multiple clients with different IDs
    const clients = ['TRADER001', 'HFT_CLIENT', 'PORTFOLIO_MGR'];
    const connections = [];
    
    for (let i = 0; i < clients.length; i++) {
        const clientId = clients[i];
        
        setTimeout(() => {
            console.log(`🔌 Connecting client: ${clientId}`);
            
            const client = Stomp.overWS('ws://localhost:8080');
            connections.push(client);
            
            let messageCount = 0;
            let snapshotComplete = false;
            
            client.connect({}, () => {
                console.log(`✅ ${clientId} connected to STOMP server`);
                
                // Subscribe to client-specific positions topic
                client.subscribe(`/snapshot/positions/${clientId}`, (message) => {
                    messageCount++;
                    const headers = message.headers;
                    
                    if (headers['message-type'] === 'snapshot') {
                        const data = JSON.parse(message.body);
                        console.log(`📦 ${clientId} - Snapshot batch ${headers['batch-number']}: ${data.length} records`);
                        
                    } else if (headers['message-type'] === 'snapshot-complete') {
                        snapshotComplete = true;
                        console.log(`📊 ${clientId} - ${message.body}`);
                        
                    } else if (headers['message-type'] === 'live-update') {
                        const data = JSON.parse(message.body);
                        const position = data[0];
                        console.log(`🔄 ${clientId} - Live update ${headers['update-number']}: ${position.positionId} = $${position.currentPrice?.toFixed(2)}`);
                    }
                    
                    // Log progress every 50 messages during snapshot
                    if (!snapshotComplete && messageCount % 50 === 0) {
                        console.log(`   📈 ${clientId} progress: ${messageCount} messages received`);
                    }
                });
                
                // Subscribe to error messages
                client.subscribe('/errors', (message) => {
                    console.error(`❌ ${clientId} Error: ${message.body}`);
                });
                
                // Wait a bit, then send trigger with different rates
                setTimeout(() => {
                    const rate = 1000 + (i * 500); // 1000, 1500, 2000 msg/sec
                    const batchSize = 50 + (i * 25);  // 50, 75, 100 batch size
                    
                    console.log(`🚀 ${clientId} - Triggering positions at ${rate} msg/sec, batch size ${batchSize}`);
                    client.send(`/snapshot/positions/${clientId}/${rate}/${batchSize}`, {}, '');
                }, 1000 + (i * 500)); // Stagger triggers
                
            }, (error) => {
                console.error(`❌ ${clientId} connection error:`, error);
            });
            
        }, i * 2000); // Stagger connections by 2 seconds
    }
    
    // Test disconnect after 30 seconds to verify cleanup
    setTimeout(() => {
        console.log('\n🔌 Testing disconnect cleanup...');
        if (connections[0]) {
            console.log(`🔚 Disconnecting ${clients[0]}`);
            connections[0].disconnect();
        }
    }, 30000);
    
    // Clean exit after 60 seconds
    setTimeout(() => {
        console.log('\n🏁 Test complete - disconnecting all clients...');
        connections.forEach((client, index) => {
            if (client && client.connected) {
                console.log(`🔚 Disconnecting ${clients[index]}`);
                client.disconnect();
            }
        });
        
        setTimeout(() => {
            console.log('✅ Enhanced STOMP client test completed!');
            process.exit(0);
        }, 2000);
    }, 60000);
}

// Test legacy compatibility
async function testLegacyCompatibility() {
    console.log('\n🔄 Testing Legacy Compatibility...\n');
    
    const client = Stomp.overWS('ws://localhost:8080');
    
    client.connect({}, () => {
        console.log('✅ Legacy client connected');
        
        // Subscribe to generic topic (legacy)
        client.subscribe('/snapshot/positions', (message) => {
            const data = JSON.parse(message.body);
            if (Array.isArray(data)) {
                console.log(`📦 Legacy - Received batch: ${data.length} records`);
            } else {
                console.log(`📄 Legacy - ${message.body}`);
            }
        });
        
        // Send legacy trigger after 1 second
        setTimeout(() => {
            console.log('🚀 Legacy - Triggering positions at 500 msg/sec');
            client.send('/snapshot/positions/500', {}, '');
        }, 1000);
        
        // Disconnect after 15 seconds
        setTimeout(() => {
            console.log('🔚 Legacy client disconnecting');
            client.disconnect();
        }, 15000);
    });
}

// Run tests
console.log('🧪 Starting Enhanced STOMP Server Tests...');
console.log('📌 Make sure the server is running: npm start\n');

// Run enhanced features test
testEnhancedFeatures();

// Run legacy compatibility test after 5 seconds
setTimeout(testLegacyCompatibility, 5000); 