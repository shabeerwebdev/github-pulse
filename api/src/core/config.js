/**
 * Centralized configuration module
 * All environment variables and settings in one place
 */

const config = {
    // Environment
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV !== 'production',

    // MongoDB
    mongo: {
        url: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/github',
        dbName: 'github',
        options: {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }
    },

    // Redis
    redis: {
        url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
        queueKey: 'github_events_queue',
        pubChannel: 'live_events'
    },

    // Service Ports
    ports: {
        stats: parseInt(process.env.STATS_PORT) || 3000,
        realtime: parseInt(process.env.REALTIME_PORT) || 4000,
        healthCheck: parseInt(process.env.HEALTH_PORT) || 8081
    },

    // Ingestion
    ingest: {
        fileUrl: process.env.GITHUB_ARCHIVE_URL || 'http://data.githubarchive.org/2024-01-01-15.json.gz',
        batchSize: parseInt(process.env.BATCH_SIZE) || 500
    }
};

// Validate required config
function validateConfig() {
    const required = ['mongo.url', 'redis.url'];
    const missing = required.filter(key => {
        const keys = key.split('.');
        let value = config;
        for (const k of keys) {
            value = value?.[k];
        }
        return !value;
    });

    if (missing.length > 0) {
        throw new Error(`Missing required config: ${missing.join(', ')}`);
    }
}

validateConfig();

export default config;
