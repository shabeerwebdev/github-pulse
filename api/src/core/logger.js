/**
 * Structured JSON logging utility
 */

const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL] || LOG_LEVELS.info;
const serviceName = process.env.SERVICE_NAME || 'gitpulse';

/**
 * Format and output a log message
 */
function log(level, message, meta = {}) {
    if (LOG_LEVELS[level] < currentLevel) return;

    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        service: serviceName,
        message,
        ...meta
    };

    const output = JSON.stringify(logEntry);

    if (level === 'error') {
        console.error(output);
    } else {
        console.log(output);
    }
}

const logger = {
    debug: (message, meta) => log('debug', message, meta),
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta),

    // Create a child logger with preset metadata
    child: (defaultMeta) => ({
        debug: (message, meta) => log('debug', message, { ...defaultMeta, ...meta }),
        info: (message, meta) => log('info', message, { ...defaultMeta, ...meta }),
        warn: (message, meta) => log('warn', message, { ...defaultMeta, ...meta }),
        error: (message, meta) => log('error', message, { ...defaultMeta, ...meta }),
    })
};

export default logger;
