/**
 * Redis client factory with separate clients for pub/sub and queue operations
 */

import { createClient } from 'redis';
import config from './config.js';
import logger from './logger.js';

let queueClient = null;
let subscriberClient = null;

/**
 * Create a Redis client with standard configuration
 */
function createRedisClient(name = 'default') {
    const client = createClient({ url: config.redis.url });

    client.on('error', (err) => {
        logger.error(`Redis ${name} error`, { error: err.message });
    });

    client.on('connect', () => {
        logger.info(`Redis ${name} connected`);
    });

    client.on('reconnecting', () => {
        logger.warn(`Redis ${name} reconnecting...`);
    });

    return client;
}

/**
 * Get or create the queue client (for push/pop operations)
 */
async function getQueueClient() {
    if (!queueClient) {
        queueClient = createRedisClient('queue');
        await queueClient.connect();
    }
    return queueClient;
}

/**
 * Get or create a subscriber client (for pub/sub)
 * Note: Subscriber clients can't be used for other commands
 */
async function getSubscriber() {
    if (!subscriberClient) {
        subscriberClient = createRedisClient('subscriber');
        await subscriberClient.connect();
    }
    return subscriberClient;
}

/**
 * Create a new publisher client
 */
async function createPublisher() {
    const publisher = createRedisClient('publisher');
    await publisher.connect();
    return publisher;
}

/**
 * Graceful shutdown
 */
async function disconnectAll() {
    const clients = [queueClient, subscriberClient].filter(Boolean);
    await Promise.all(clients.map(c => c.quit()));
    queueClient = null;
    subscriberClient = null;
    logger.info('All Redis clients disconnected');
}

// Handle process termination
process.on('SIGINT', disconnectAll);
process.on('SIGTERM', disconnectAll);

export {
    getQueueClient,
    getSubscriber,
    createPublisher,
    disconnectAll,
    createRedisClient
};
