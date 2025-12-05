/**
 * Consumer Service - Redis Queue to MongoDB
 * Consumes events from Redis queue and batch inserts into MongoDB
 */

import { connect, getDb } from '../../core/mongo.js';
import { getQueueClient } from '../../core/redis.js';
import config from '../../core/config.js';
import logger from '../../core/logger.js';
import http from 'http';

const BATCH_SIZE = config.ingest.batchSize;
const buffer = [];
let isShuttingDown = false;

/**
 * Health check server
 */
function startHealthServer() {
    const server = http.createServer((req, res) => {
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'ok',
                service: 'consumer',
                bufferSize: buffer.length,
                timestamp: new Date().toISOString()
            }));
        } else {
            res.writeHead(404);
            res.end();
        }
    });

    server.listen(8081, '0.0.0.0', () => {
        logger.info('Consumer health server running', { port: 8081 });
    });

    return server;
}

/**
 * Flush buffer to MongoDB
 */
async function flushBuffer(collection) {
    if (buffer.length === 0) return;

    const toInsert = buffer.splice(0, buffer.length);
    try {
        await collection.insertMany(toInsert, { ordered: false });
        logger.info('Inserted events', { count: toInsert.length });
    } catch (error) {
        // Handle duplicate key errors gracefully
        if (error.code === 11000) {
            logger.warn('Some duplicate events skipped', { count: toInsert.length });
        } else {
            logger.error('Insert failed', { error: error.message });
            // Put events back in buffer for retry
            buffer.unshift(...toInsert);
        }
    }
}

/**
 * Main consumer loop
 */
async function startConsumer() {
    // Connect to databases
    await connect();
    const db = getDb();
    const collection = db.collection('events');
    const redis = await getQueueClient();

    // Start health check server
    startHealthServer();

    logger.info('Consumer service running', { batchSize: BATCH_SIZE });

    // Process queue
    while (!isShuttingDown) {
        try {
            const result = await redis.blPop(config.redis.queueKey, 1);

            if (result) {
                const event = JSON.parse(result.element);
                buffer.push(event);

                if (buffer.length >= BATCH_SIZE) {
                    await flushBuffer(collection);
                }
            }
        } catch (error) {
            if (!isShuttingDown) {
                logger.error('Consumer error', { error: error.message });
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    // Final flush on shutdown
    await flushBuffer(collection);
    logger.info('Consumer shutdown complete');
}

// Graceful shutdown
async function shutdown() {
    logger.info('Consumer shutting down...');
    isShuttingDown = true;
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startConsumer().catch(error => {
    logger.error('Consumer failed to start', { error: error.message });
    process.exit(1);
});
