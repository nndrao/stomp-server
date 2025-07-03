# STOMP Fixed Income Server

A STOMP server that publishes position and trade data for fixed income instruments.

## Features

- Generates 20,000 position records with 300+ attributes
- Generates 60,000 trade records linked to positions via CUSIP
- Real-time streaming with configurable update rates
- Snapshot delivery followed by live updates
- Automatic date updates to current date

## Setup

1. Install dependencies:
```bash
npm install
```

2. Generate data files:
```bash
npm run generate-data
```

This will create:
- `data/positions.json` - 20,000 position records
- `data/trades.json` - 60,000 trade records

3. **Choose your data source:**

### Option A: Use Local JSON Files (No Database Required)
```bash
npm run start:local
```

### Option B: Use MongoDB Atlas (Cloud Database)
First migrate data to MongoDB:
```bash
npm run migrate-to-mongodb
```

Then start normally:
```bash
npm start
```

The server will run on `ws://localhost:8080`

## Data Source Configuration

The server supports multiple data loading options:

### 🏠 **Local JSON Files** (Recommended for testing)
- **Pros**: No external dependencies, fastest startup, works offline
- **Cons**: No persistence of live updates, larger memory usage
- **Usage**: `npm run start:local` or set `USE_LOCAL_DATA=true`

### ☁️ **MongoDB Atlas** (Recommended for production)
- **Pros**: Scalable, persistent updates, query capabilities
- **Cons**: Requires internet connection and MongoDB setup
- **Usage**: `npm start` (default behavior)

### 🔄 **Automatic Fallback**
The server automatically falls back to local files if MongoDB is unavailable, ensuring reliable operation.

## Usage

The server requires a two-step process:

### Step 1: Subscribe to the topic
- Position data: `/snapshot/positions`
- Trade data: `/snapshot/trades`

### Step 2: Send trigger message
- Position trigger: Send any message to `/snapshot/positions/{rate}`
- Trade trigger: Send any message to `/snapshot/trades/{rate}`
- Where `{rate}` is messages per second (e.g., 1000)

### Message Flow

1. Client subscribes to `/snapshot/positions` or `/snapshot/trades`
2. Client sends trigger message to `/snapshot/positions/1000` (or desired rate)
3. Server starts sending all historical data as snapshots
4. Server sends "Success: All X records delivered" message when complete
5. Server continues sending live updates on the same subscription

### Example Clients

Test basic functionality:
```bash
npm run test-client
```

Run example with positions at 1000 msg/sec:
```bash
npm run example positions 1000
```

Run example with trades at 500 msg/sec:
```bash
npm run example trades 500
```

## Data Schemas

### Position Schema
- 300+ attributes including nested objects
- Key fields: positionId, cusip, marketValue, pnl, risk metrics
- See `schemas/positionSchema.json` for full schema

### Trade Schema
- Comprehensive trade lifecycle data
- Key fields: tradeId, cusip, price, quantity, execution details
- See `schemas/tradeSchema.json` for full schema

## Technical Details

- WebSocket-based STOMP protocol
- Dates automatically updated to current date
- CUSIPs shared between positions and trades
- Real-time price and risk updates