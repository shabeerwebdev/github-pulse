/**
 * Ingest Service - GitHub Archive to Redis
 * Downloads GitHub Archive data and pushes to Redis queue
 */

import axios from 'axios';
import zlib from 'node:zlib';
import readline from 'node:readline';
import { getQueueClient, createPublisher } from '../../core/redis.js';
import config from '../../core/config.js';
import logger from '../../core/logger.js';

/**
 * Download and process GitHub Archive file
 */
async function ingestData() {
    const redis = await getQueueClient();
    const publisher = await createPublisher();

    logger.info('Starting ingestion', { url: config.ingest.fileUrl });

    try {
        const response = await axios({
            url: config.ingest.fileUrl,
            method: 'GET',
            responseType: 'stream',
            timeout: 60000
        });

        const gunzipStream = response.data.pipe(zlib.createGunzip());
        const rl = readline.createInterface({ input: gunzipStream });

        let count = 0;
        let errors = 0;

        for await (const line of rl) {
            if (!line.trim()) continue;

            try {
                const event = JSON.parse(line);
                const eventString = JSON.stringify(event);

                // Push to queue for consumer
                await redis.rPush(config.redis.queueKey, eventString);

                // Publish for realtime subscribers
                await publisher.publish(config.redis.pubChannel, eventString);

                count++;
                if (count % 1000 === 0) {
                    logger.info('Ingestion progress', { queued: count });
                }
            } catch (parseError) {
                errors++;
            }
        }

        logger.info('Ingestion complete', {
            total: count,
            errors,
            successRate: `${((count / (count + errors)) * 100).toFixed(2)}%`
        });

    } catch (error) {
        logger.error('Ingestion failed', { error: error.message });
        throw error;
    } finally {
        await publisher.quit();
        await redis.quit();
    }
}

// Run ingestion
ingestData()
    .then(() => {
        logger.info('Ingest service finished');
        process.exit(0);
    })
    .catch(error => {
        logger.error('Ingest service failed', { error: error.message });
        process.exit(1);
    });
