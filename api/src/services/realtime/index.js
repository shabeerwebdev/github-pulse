/**
 * Realtime Service - WebSocket Server
 * Subscribes to Redis pub/sub and broadcasts to connected clients
 */

import http from 'http';
import { Server } from 'socket.io';
import { getSubscriber } from '../../core/redis.js';
import config from '../../core/config.js';
import logger from '../../core/logger.js';

let connectedClients = 0;

/**
 * Start WebSocket server
 */
async function startRealtime() {
    // Create HTTP server with health endpoint
    const server = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'ok',
                service: 'realtime',
                connectedClients,
                timestamp: new Date().toISOString()
            }));
            return;
        }

        res.writeHead(404);
        res.end();
    });

    // Socket.IO setup
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    // Redis subscriber
    const subscriber = await getSubscriber();

    // Subscribe to live events channel
    await subscriber.subscribe(config.redis.pubChannel, (message) => {
        try {
            const event = JSON.parse(message);
            io.emit('github_event', event);
        } catch (error) {
            logger.warn('Failed to parse event', { error: error.message });
        }
    });

    // Handle client connections
    io.on('connection', (socket) => {
        connectedClients++;
        logger.info('Client connected', {
            socketId: socket.id,
            totalClients: connectedClients
        });

        socket.on('disconnect', () => {
            connectedClients--;
            logger.info('Client disconnected', {
                socketId: socket.id,
                totalClients: connectedClients
            });
        });
    });

    // Start server
    server.listen(config.ports.realtime, '0.0.0.0', () => {
        logger.info('Realtime service running', { port: config.ports.realtime });
    });
}

startRealtime().catch(error => {
    logger.error('Realtime service failed', { error: error.message });
    process.exit(1);
});
