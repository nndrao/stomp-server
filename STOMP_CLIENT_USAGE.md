# STOMP Fixed Income Server - Client Usage Guide

## 📋 Overview

The STOMP Fixed Income Server provides real-time streaming of position and trade data for fixed income instruments. It supports both **client-specific** and **generic** data streams with configurable message rates.

## 🔌 Connection Setup

### WebSocket Connection
```javascript
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8080');
```

### STOMP Protocol Connection
```javascript
// Send STOMP CONNECT frame
ws.send('CONNECT\naccept-version:1.2\nhost:localhost\n\n\0');

// Wait for CONNECTED response
ws.on('message', (data) => {
    if (data.toString().includes('CONNECTED')) {
        console.log('✅ STOMP Connected');
        // Now you can subscribe and send triggers
    }
});
```

## 🎯 Enhanced Usage (Client-Specific Streaming)

### **Step 1: Subscribe to Client-Specific Topic**

Subscribe to your dedicated client topic before sending triggers:

```javascript
// Position data for specific client
ws.send('SUBSCRIBE\nid:pos-sub\ndestination:/snapshot/positions/TRADER001\n\n\0');

// Trade data for specific client  
ws.send('SUBSCRIBE\nid:trade-sub\ndestination:/snapshot/trades/HFT_CLIENT\n\n\0');
```

### **Step 2: Send Client-Specific Trigger**

Send trigger message to start data delivery:

```javascript
// Trigger position data at 1000 msg/sec
ws.send('SEND\ndestination:/snapshot/positions/TRADER001/1000\n\n\0');

// Trigger trade data at 5000 msg/sec with batch size 100
ws.send('SEND\ndestination:/snapshot/trades/HFT_CLIENT/5000/100\n\n\0');
```

### **Topic Pattern**
```
Subscribe to: /snapshot/{dataType}/{clientId}
Trigger with: /snapshot/{dataType}/{clientId}/{rate}[/{batchSize}]
```

Where:
- `{dataType}`: `positions` or `trades`
- `{clientId}`: Your unique client identifier (e.g., `TRADER001`, `HFT_CLIENT`)
- `{rate}`: Messages per second (e.g., `1000`, `5000`)
- `{batchSize}`: Optional batch size (defaults to rate/10)

## 🔄 Legacy Usage (Generic Streaming)

### **Step 1: Subscribe to Generic Topic**
```javascript
// Generic position data
ws.send('SUBSCRIBE\nid:pos-sub\ndestination:/snapshot/positions\n\n\0');

// Generic trade data
ws.send('SUBSCRIBE\nid:trade-sub\ndestination:/snapshot/trades\n\n\0');
```

### **Step 2: Send Generic Trigger**
```javascript
// Trigger at 1000 msg/sec
ws.send('SEND\ndestination:/snapshot/positions/1000\n\n\0');

// Trigger with custom batch size
ws.send('SEND\ndestination:/snapshot/trades/500/50\n\n\0');
```

## 📊 Message Flow Lifecycle

### **1. Snapshot Phase**
- Server delivers **all historical data** in batches
- Messages have `message-type: snapshot` header
- Each batch contains multiple records as JSON array
- Fixed 10ms intervals between batches

### **2. Completion Notification**
```
Success: All X records delivered to client 'CLIENT_ID'. Starting live updates...
```

### **3. Live Updates Phase**
- Server sends **real-time updates** continuously
- Messages have `message-type: live-update` header
- Each update contains single record changes
- Updates sent at specified rate (msg/sec)

## 💻 Complete Client Examples

### **Example 1: Node.js Client with STOMP.js**

```javascript
const Stomp = require('stompjs');
Object.assign(global, { WebSocket: require('ws') });

const client = Stomp.overWS('ws://localhost:8080');

let messageCount = 0;
const clientId = 'TRADER001';

client.connect({}, () => {
    console.log('🔌 Connected to STOMP server');
    
    // Subscribe to client-specific positions
    client.subscribe(`/snapshot/positions/${clientId}`, (message) => {
        const data = JSON.parse(message.body);
        messageCount++;
        
        if (message.headers['message-type'] === 'snapshot') {
            console.log(`📦 Snapshot batch: ${data.length} records`);
        } else if (message.headers['message-type'] === 'live-update') {
            console.log(`🔄 Live update: ${data[0].positionId}`);
        }
        
        if (messageCount % 100 === 0) {
            console.log(`📊 Received ${messageCount} messages`);
        }
    });
    
    // Wait 1 second then trigger data at 2000 msg/sec
    setTimeout(() => {
        client.send(`/snapshot/positions/${clientId}/2000`, {}, '');
    }, 1000);
});
```

### **Example 2: Raw WebSocket Client**

```javascript
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8080');

const clientId = 'HFT_CLIENT';
let connected = false;

ws.on('open', () => {
    // Connect to STOMP
    ws.send('CONNECT\naccept-version:1.2\nhost:localhost\n\n\0');
});

ws.on('message', (data) => {
    const message = data.toString();
    
    if (message.includes('CONNECTED') && !connected) {
        connected = true;
        console.log('✅ STOMP Connected');
        
        // Subscribe to client-specific trades
        ws.send(`SUBSCRIBE\nid:trade-${clientId}\ndestination:/snapshot/trades/${clientId}\n\n\0`);
        
        // Trigger after subscription
        setTimeout(() => {
            ws.send(`SEND\ndestination:/snapshot/trades/${clientId}/5000/200\n\n\0`);
        }, 100);
        
    } else if (message.includes('MESSAGE')) {
        // Parse STOMP message
        const lines = message.split('\n');
        const headers = {};
        let bodyStart = 0;
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i] === '') {
                bodyStart = i + 1;
                break;
            }
            const [key, value] = lines[i].split(':');
            if (key) headers[key] = value;
        }
        
        const body = lines.slice(bodyStart).join('\n').replace(/\0$/, '');
        
        if (headers['message-type'] === 'live-update') {
            const trades = JSON.parse(body);
            console.log(`🔄 Trade update: ${trades[0].tradeId} - $${trades[0].price}`);
        }
    }
});

ws.on('close', () => {
    console.log('🔌 Disconnected from server');
});
```

### **Example 3: Multiple Client Simulation**

```javascript
const Stomp = require('stompjs');
Object.assign(global, { WebSocket: require('ws') });

// Create multiple clients
const clients = ['TRADER001', 'TRADER002', 'HFT_CLIENT'];

clients.forEach((clientId, index) => {
    const client = Stomp.overWS('ws://localhost:8080');
    
    client.connect({}, () => {
        console.log(`🔌 Client ${clientId} connected`);
        
        // Each client subscribes to their own stream
        client.subscribe(`/snapshot/positions/${clientId}`, (message) => {
            if (message.headers['message-type'] === 'live-update') {
                const data = JSON.parse(message.body);
                console.log(`📈 ${clientId}: ${data[0].positionId} = $${data[0].currentPrice}`);
            }
        });
        
        // Stagger triggers and use different rates
        setTimeout(() => {
            const rate = 1000 + (index * 500); // 1000, 1500, 2000 msg/sec
            client.send(`/snapshot/positions/${clientId}/${rate}`, {}, '');
        }, index * 2000); // Stagger by 2 seconds
    });
});
```

## 📡 Message Headers Reference

### **Snapshot Messages**
```
subscription: sub-id
message-id: msg-timestamp-batch-N
destination: /snapshot/{dataType}/{clientId}
content-type: application/json
batch-number: N
client-id: clientId
message-type: snapshot
```

### **Live Update Messages**
```
subscription: sub-id  
message-id: msg-timestamp-random
destination: /snapshot/{dataType}/{clientId}
content-type: application/json
message-type: live-update
client-id: clientId
update-number: N
```

### **Completion Messages**
```
subscription: sub-id
message-id: msg-timestamp
destination: /snapshot/{dataType}/{clientId}
client-id: clientId
message-type: snapshot-complete
```

## 📊 Performance Guidelines

### **Message Rates**
- **Low Frequency**: 100-500 msg/sec
- **Medium Frequency**: 1,000-2,000 msg/sec  
- **High Frequency**: 5,000-10,000 msg/sec
- **Ultra High Frequency**: 10,000+ msg/sec

### **Batch Sizes**
- **Small Batches**: 10-25 records (more frequent updates)
- **Medium Batches**: 50-100 records (balanced)
- **Large Batches**: 200-500 records (fewer network calls)

### **Recommended Combinations**
```javascript
// High frequency trading
/snapshot/positions/HFT_CLIENT/10000/500

// Real-time risk monitoring  
/snapshot/positions/RISK_SYSTEM/2000/100

// Portfolio management
/snapshot/positions/PORTFOLIO_MGR/500/25

// Compliance monitoring
/snapshot/trades/COMPLIANCE/1000/50
```

## 🎛️ Client Configuration Options

### **Connection Settings**
```javascript
const client = Stomp.overWS('ws://localhost:8080', null, {
    'heart-beat': '0,0',           // No heartbeat
    'accept-version': '1.2',       // STOMP version
    'login': 'optional',           // Authentication (if needed)
    'passcode': 'optional'         // Authentication (if needed)
});
```

### **Subscription Options**
```javascript
client.subscribe('/snapshot/positions/CLIENT_ID', callback, {
    'id': 'custom-sub-id',         // Custom subscription ID
    'ack': 'auto'                  // Auto acknowledge messages
});
```

## ❌ Error Handling

### **Common Errors**

**1. No Subscription Found**
```
Error: No subscription found for /snapshot/positions/CLIENT_ID. Please subscribe first.
```
**Solution**: Subscribe to the topic before sending trigger

**2. Invalid Trigger Pattern**
```
❓ Unrecognized trigger pattern: /snapshot/invalid/pattern
```
**Solution**: Use correct pattern `/snapshot/{dataType}/{clientId}/{rate}`

**3. Connection Lost**
```
🔌 Client disconnected - stopping live updates
```
**Solution**: Automatic cleanup, reconnect if needed

### **Error Handling Example**
```javascript
client.subscribe('/errors', (message) => {
    console.error('❌ Server Error:', message.body);
});

ws.on('error', (error) => {
    console.error('🔌 WebSocket Error:', error);
    // Implement reconnection logic
});

ws.on('close', () => {
    console.log('🔌 Connection closed, reconnecting...');
    // Implement reconnection logic
});
```

## 🔍 Debugging Tips

### **1. Enable Request Logging**
All client requests are logged to `requests.log`:
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "clientId": "123456789",
  "destination": "/snapshot/positions/TRADER001/1000",
  "headers": {...},
  "body": ""
}
```

### **2. Monitor Server Console**
Watch for these log messages:
```
🎯 Client-specific subscription detected: /snapshot/positions/TRADER001
📝 Client-specific trigger pattern matched: DataType: positions, ClientId: TRADER001
🚀 Starting client-specific data delivery: Client: TRADER001
📦 Client 'TRADER001' batch 1: 50 records (1-50/1000)
🔄 Live update 1 → client 'TRADER001': POS-abc123
```

### **3. Check Health Endpoint**
```bash
curl http://localhost:8080/health
```

### **4. Test Connection**
```bash
npm run test-client
```

## 🚀 Quick Start Checklist

1. ✅ **Connect**: Send STOMP CONNECT frame
2. ✅ **Wait**: For CONNECTED response  
3. ✅ **Subscribe**: To `/snapshot/{dataType}/{clientId}`
4. ✅ **Trigger**: Send to `/snapshot/{dataType}/{clientId}/{rate}`
5. ✅ **Receive**: Snapshot batches → completion → live updates

## 📞 Support

- **Server Health**: `GET /health`
- **Log Files**: `requests.log`, `delivered-positions-{clientId}.log`  
- **Examples**: See `exampleClient.js`, `testClient.js`
- **Performance**: Run `npm run perf-test`

---

**🎯 Remember**: Always subscribe first, then trigger. Each client gets their own isolated data stream with automatic cleanup on disconnect! 