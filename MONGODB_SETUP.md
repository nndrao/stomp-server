# MongoDB Atlas Setup and Migration Guide

This project has been updated to use MongoDB Atlas instead of local JSON files for storing positions and trades data.

## Prerequisites

1. **MongoDB Atlas Account**: Create a free account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Database User**: You already have a user `datatableuser` configured
3. **Connection String**: You have the connection string provided

## Setup Steps

### 1. Configure Environment Variables

Edit the `config.env` file and replace `<db_password>` with your actual MongoDB password:

```env
MONGODB_URI=mongodb+srv://datatableuser:YOUR_ACTUAL_PASSWORD@cluster0.yslqyef.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DATABASE_NAME=stomp_server
POSITIONS_COLLECTION=positions
TRADES_COLLECTION=trades
```

### 2. Install Dependencies

The following MongoDB-related dependencies have been added:
- `mongodb` - MongoDB Node.js driver
- `dotenv` - Environment variable management

They should already be installed, but if needed run:
```bash
npm install
```

### 3. Migrate Data to MongoDB

Run the migration script to upload your existing JSON data to MongoDB Atlas:

```bash
npm run migrate-to-mongodb
```

Or directly:
```bash
node migrateToMongoDB.js
```

This will:
- Connect to your MongoDB Atlas cluster
- Clear any existing data in the collections
- Upload all positions data in batches (1000 records per batch)
- Upload all trades data in batches (1000 records per batch)  
- Create indexes for better query performance
- Display progress during the migration

### 4. Start the Server

Once migration is complete, start the server:

```bash
npm start
```

The server will now load data from MongoDB instead of local JSON files.

## What Changed

### Files Added:
- `migrateToMongoDB.js` - Migration script
- `mongoDataAccess.js` - MongoDB data access layer
- `config.env` - Environment configuration
- `.gitignore` - Excludes large data files and environment files
- `MONGODB_SETUP.md` - This guide

### Files Modified:
- `server2.js` - Updated to use MongoDB instead of JSON files
- `package.json` - Added migration script

### Files Removed from Git:
- `data/positions.json` - Now stored in MongoDB (files still exist locally)
- `data/trades.json` - Now stored in MongoDB (files still exist locally)

## Benefits

1. **No Git LFS Required**: Large files are no longer in version control
2. **Better Performance**: MongoDB indexes provide faster queries
3. **Scalability**: Database can handle much larger datasets
4. **Filtering**: Can query specific subsets of data efficiently
5. **Real-time Updates**: Can persist live updates to the database

## Troubleshooting

### Connection Issues
- Verify your MongoDB password in `config.env`
- Check that your IP address is whitelisted in MongoDB Atlas
- Ensure network connectivity to MongoDB Atlas

### Migration Issues
- Make sure the original JSON files exist in the `data/` directory
- Check MongoDB Atlas cluster is running
- Verify sufficient storage space in your Atlas cluster

### Server Startup Issues
- Run migration first: `npm run migrate-to-mongodb`
- Check MongoDB connection in server logs
- Verify environment variables are loaded correctly

## MongoDB Collections Structure

### Positions Collection
- **Collection Name**: `positions`
- **Indexes**: positionId (unique), cusip, trader, desk, instrumentType
- **Document Count**: ~50,000+ documents
- **Size**: ~134MB of data

### Trades Collection  
- **Collection Name**: `trades`
- **Indexes**: tradeId (unique), cusip, trader, tradeDate, side, status
- **Document Count**: ~100,000+ documents  
- **Size**: ~294MB of data

## Data Access Methods

The `mongoDataAccess.js` module provides methods for:
- Getting all positions/trades
- Filtering by trader, desk, instrument type, etc.
- Paginated queries
- Random sampling
- Bulk updates for live data streaming

## Security Notes

- Keep your `config.env` file secure and never commit it to version control
- Use strong passwords for your MongoDB users
- Regularly rotate database passwords
- Monitor database access logs 