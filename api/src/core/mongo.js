/**
 * MongoDB connection singleton with connection pooling
 */

import { MongoClient } from 'mongodb';
import config from './config.js';
import logger from './logger.js';

let client = null;
let db = null;

/**
 * Connect to MongoDB with connection pooling
 */
async function connect() {
    if (db) return db;

    try {
        client = new MongoClient(config.mongo.url, config.mongo.options);
        await client.connect();
        db = client.db(config.mongo.dbName);

        logger.info('MongoDB connected', {
            database: config.mongo.dbName,
            poolSize: config.mongo.options.maxPoolSize
        });

        return db;
    } catch (error) {
        logger.error('MongoDB connection failed', { error: error.message });
        throw error;
    }
}

/**
 * Get the database instance
 */
function getDb() {
    if (!db) {
        throw new Error('Database not connected. Call connect() first.');
    }
    return db;
}

/**
 * Get the MongoDB client
 */
function getClient() {
    return client;
}

/**
 * Graceful shutdown
 */
async function disconnect() {
    if (client) {
        await client.close();
        client = null;
        db = null;
        logger.info('MongoDB disconnected');
    }
}

// Handle process termination
process.on('SIGINT', disconnect);
process.on('SIGTERM', disconnect);

export { connect, getDb, getClient, disconnect };
