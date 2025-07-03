const WebSocket = require('ws');

// Performance test for 5000 msg/sec
async function testHighFrequencyMessages() {
    const ws = new WebSocket('ws://localhost:8080');
    
    let messageCount = 0;
    let startTime;
    const targetRate = 5000; // messages per second
    const testDuration = 10; // seconds
    
    ws.on('open', () => {
        console.log('🔌 Connected to STOMP server');
        
        // Send STOMP CONNECT frame
        ws.send('CONNECT\naccept-version:1.2\nhost:localhost\n\n\0');
    });
    
    ws.on('message', (data) => {
        const message = data.toString();
        
        if (message.includes('CONNECTED')) {
            console.log('✅ STOMP connected');
            
            // Subscribe to position updates
            ws.send('SUBSCRIBE\nid:perf-test\ndestination:/snapshot/positions\n\n\0');
            
        } else if (message.includes('destination:/snapshot/positions')) {
            if (!startTime) {
                startTime = Date.now();
                console.log(`🚀 Starting performance test: ${targetRate} msg/sec for ${testDuration} seconds`);
                
                // Send trigger message for high-frequency updates
                ws.send(`SEND\ndestination:/snapshot/positions/${targetRate}\n\n\0`);
            }
            
            messageCount++;
            
            // Log progress every 1000 messages
            if (messageCount % 1000 === 0) {
                const elapsed = (Date.now() - startTime) / 1000;
                const currentRate = messageCount / elapsed;
                console.log(`📊 Messages: ${messageCount}, Elapsed: ${elapsed.toFixed(1)}s, Rate: ${currentRate.toFixed(0)} msg/sec`);
            }
            
            // Stop test after duration
            if (messageCount >= targetRate * testDuration) {
                const elapsed = (Date.now() - startTime) / 1000;
                const actualRate = messageCount / elapsed;
                
                console.log('\n🏁 Performance Test Results:');
                console.log(`   Target Rate: ${targetRate} msg/sec`);
                console.log(`   Actual Rate: ${actualRate.toFixed(0)} msg/sec`);
                console.log(`   Total Messages: ${messageCount}`);
                console.log(`   Test Duration: ${elapsed.toFixed(2)} seconds`);
                console.log(`   Performance: ${((actualRate / targetRate) * 100).toFixed(1)}% of target`);
                
                if (actualRate >= targetRate * 0.95) {
                    console.log('✅ PERFORMANCE TEST PASSED');
                } else {
                    console.log('❌ PERFORMANCE TEST FAILED');
                }
                
                process.exit(0);
            }
        }
    });
    
    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
    });
    
    ws.on('close', () => {
        console.log('🔌 Connection closed');
    });
}

console.log('🏃‍♂️ High-Frequency Performance Test');
console.log('Make sure server is running: npm start');
console.log('This will test 5000 messages/second for 10 seconds\n');

// Wait 2 seconds for server to be ready
setTimeout(testHighFrequencyMessages, 2000); 