/**
 * Stats API Service - Entry Point
 */

import express from 'express';
import cors from 'cors';
import { connect } from '../../core/mongo.js';
import config from '../../core/config.js';
import logger from '../../core/logger.js';
import { statsRoutes } from './routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    logger.info('Request', { method: req.method, path: req.path });
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'stats', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', statsRoutes);

// Error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function start() {
    try {
        await connect();

        app.listen(config.ports.stats, '0.0.0.0', () => {
            logger.info('Stats service running', { port: config.ports.stats });
        });
    } catch (error) {
        logger.error('Failed to start stats service', { error: error.message });
        process.exit(1);
    }
}

start();
