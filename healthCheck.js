const http = require('http');
const mongoDataAccess = require('./mongoDataAccess');

// Health check server
const PORT = process.env.HEALTH_PORT || 3000;

const server = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/health') {
        try {
            // Check MongoDB connection
            await mongoDataAccess.getPositionsCount();
            
            const healthStatus = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                database: 'connected',
                memory: process.memoryUsage(),
                environment: process.env.NODE_ENV || 'development'
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(healthStatus, null, 2));
        } catch (error) {
            const errorStatus = {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error.message,
                database: 'disconnected'
            };

            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(errorStatus, null, 2));
        }
    } else if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            name: 'STOMP Fixed Income Server',
            version: '1.0.0',
            endpoints: {
                health: '/health',
                websocket: `ws://localhost:${process.env.PORT || 8080}`
            }
        }, null, 2));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

server.listen(PORT, () => {
    console.log(`📋 Health check server running on port ${PORT}`);
});

module.exports = server; 