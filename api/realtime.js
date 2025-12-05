console.error('DEBUG REDIS_URL:', process.env.REDIS_URL);
import http from 'http'
import { createClient } from 'redis';
import { Server } from 'socket.io'

async function watchRealtime() {
    const server = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }
    });
    const io = new Server(server, {
        cors: {
            origin: "*", // Allow all origins for now (crucial for React later)
            methods: ["GET", "POST"]
        }
    });

    console.log('REDIS_URL:', process.env.REDIS_URL);
    const redisUrl = process.env.REDIS_URL && process.env.REDIS_URL.trim() ? process.env.REDIS_URL : 'redis://redis:6379';
    console.error('Using Redis URL:', redisUrl);
    const redis = createClient({ url: redisUrl });
    redis.on('error', (err) => console.error('Redis client err', err))
    await redis.connect();

    await redis.subscribe('live_events', (msg) => {
        const event = JSON.parse(msg)
        io.emit('github_event', event)
    })

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`)
        socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`))
    })

    server.listen(4000, '0.0.0.0', () => console.log('Realtime service running'));
}

watchRealtime().catch(console.err)
