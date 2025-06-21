const Stomp = require('stompjs');

// For Node.js environment
Object.assign(global, { WebSocket: require('ws') });

const client = Stomp.overWS('ws://localhost:8080');

// Command line arguments
const dataType = process.argv[2] || 'positions'; // positions or trades
const rate = process.argv[3] || '1000'; // messages per second

if (!['positions', 'trades'].includes(dataType)) {
    console.error('Usage: node exampleClient.js [positions|trades] [rate]');
    console.error('Example: node exampleClient.js positions 1000');
    process.exit(1);
}

let messageCount = 0;
let snapshotCount = 0;
let updateCount = 0;
let startTime = null;
let snapshotCompleteTime = null;

console.log(`Connecting to STOMP server for ${dataType} at ${rate} messages/second...`);

client.connect({}, () => {
    console.log('Connected successfully!');
    console.log('');
    
    // Subscribe to the snapshot topic
    const subscription = client.subscribe(`/snapshot/${dataType}`, (message) => {
        messageCount++;
        
        if (message.body.startsWith('Success')) {
            // Snapshot complete
            snapshotCompleteTime = Date.now();
            const duration = (snapshotCompleteTime - startTime) / 1000;
            
            console.log('\n' + '='.repeat(60));
            console.log('SNAPSHOT DELIVERY COMPLETE');
            console.log('='.repeat(60));
            console.log(message.body);
            console.log(`Total ${dataType} received: ${snapshotCount}`);
            console.log(`Time taken: ${duration.toFixed(2)} seconds`);
            console.log(`Effective rate: ${(snapshotCount / duration).toFixed(0)} messages/second`);
            console.log('='.repeat(60) + '\n');
            console.log('Now receiving live updates...\n');
            
            updateCount = 0;
        } else {
            try {
                const data = JSON.parse(message.body);
                const messageType = message.headers['message-type'] || 'snapshot';
                
                if (messageType === 'snapshot') {
                    snapshotCount++;
                    
                    // Show first record details
                    if (snapshotCount === 1) {
                        console.log(`First ${dataType.slice(0, -1)} received:`);
                        if (dataType === 'positions') {
                            console.log(`  Position ID: ${data.positionId}`);
                            console.log(`  CUSIP: ${data.cusip}`);
                            console.log(`  Instrument: ${data.instrumentName}`);
                            console.log(`  Notional: $${data.notionalAmount?.toLocaleString()}`);
                            console.log(`  Market Value: $${data.marketValue?.toLocaleString()}`);
                        } else {
                            console.log(`  Trade ID: ${data.tradeId}`);
                            console.log(`  CUSIP: ${data.cusip}`);
                            console.log(`  Side: ${data.side}`);
                            console.log(`  Quantity: ${data.quantity}`);
                            console.log(`  Price: ${data.price}`);
                        }
                        console.log('\nReceiving snapshot data...\n');
                    }
                    
                    // Progress updates
                    if (snapshotCount % 1000 === 0) {
                        const elapsed = (Date.now() - startTime) / 1000;
                        const percentage = dataType === 'positions' 
                            ? (snapshotCount / 20000 * 100).toFixed(1)
                            : (snapshotCount / 60000 * 100).toFixed(1);
                        console.log(`Progress: ${snapshotCount} ${dataType} received (${percentage}% complete, ${elapsed.toFixed(1)}s elapsed)`);
                    }
                } else {
                    // Live update
                    updateCount++;
                    if (updateCount % 100 === 0) {
                        if (dataType === 'positions') {
                            console.log(`Live update #${updateCount}: CUSIP=${data.cusip}, Price=${data.currentPrice?.toFixed(4)}, PnL=${data.pnl}, DV01=${data.dv01?.toFixed(2)}`);
                        } else {
                            console.log(`Live update #${updateCount}: Trade=${data.tradeId}, CUSIP=${data.cusip}, Side=${data.side}, Price=${data.price?.toFixed(4)}, Notional=${data.notionalAmount}`);
                        }
                    }
                }
            } catch (e) {
                console.error('Error parsing message:', e.message);
            }
        }
    });
    
    console.log(`Subscribed to /snapshot/${dataType}`);
    console.log(`Waiting 1 second before sending trigger...`);
    
    // Send trigger message after a short delay
    setTimeout(() => {
        console.log(`\nSending trigger message to /snapshot/${dataType}/${rate}`);
        startTime = Date.now();
        client.send(`/snapshot/${dataType}/${rate}`, {}, 'START');
        console.log('Trigger sent! Receiving data...\n');
    }, 1000);
    
    // Run for specified duration or until Ctrl+C
    const duration = 60000; // 60 seconds
    setTimeout(() => {
        console.log('\n' + '='.repeat(60));
        console.log('TEST COMPLETE - FINAL STATISTICS');
        console.log('='.repeat(60));
        console.log(`Data type: ${dataType}`);
        console.log(`Requested rate: ${rate} messages/second`);
        console.log(`Total messages received: ${messageCount}`);
        console.log(`Snapshot messages: ${snapshotCount}`);
        console.log(`Live updates: ${updateCount}`);
        
        if (snapshotCompleteTime) {
            const totalDuration = (Date.now() - startTime) / 1000;
            const updateDuration = (Date.now() - snapshotCompleteTime) / 1000;
            console.log(`\nTiming:`);
            console.log(`  Total test duration: ${totalDuration.toFixed(2)} seconds`);
            console.log(`  Snapshot phase: ${((snapshotCompleteTime - startTime) / 1000).toFixed(2)} seconds`);
            console.log(`  Update phase: ${updateDuration.toFixed(2)} seconds`);
            console.log(`\nRates:`);
            console.log(`  Snapshot delivery rate: ${(snapshotCount / ((snapshotCompleteTime - startTime) / 1000)).toFixed(0)} messages/second`);
            console.log(`  Update rate: ${(updateCount / updateDuration).toFixed(0)} messages/second`);
        }
        console.log('='.repeat(60) + '\n');
        
        subscription.unsubscribe();
        client.disconnect(() => {
            console.log('Disconnected from server');
            process.exit(0);
        });
    }, duration);
    
}, (error) => {
    console.error('Connection failed:', error);
    process.exit(1);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('\n\nShutting down gracefully...');
    client.disconnect(() => {
        console.log('Disconnected');
        process.exit(0);
    });
});

// Suppress debug messages unless there's an error
client.debug = (str) => {
    if (str.includes('ERROR') || process.env.DEBUG) {
        console.error('STOMP Debug:', str);
    }
};