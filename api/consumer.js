import { createClient } from "redis";
import { MongoClient } from "mongodb";

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const uri = process.env.MONGO_URL || 'mongodb://localhost:27017/github';
const BATCH_SIZE = 500;

async function startConsumer() {
    // redis connection
    const redis = createClient({ url: REDIS_URL })
    redis.on("error", (err) => console.error("Redis error", err))
    await redis.connect();

    // MongoDB connection
    const mongo = new MongoClient(MONGO_URL)
    await mongo.connect()
    const db = mongo.db('github')
    const collection = db.collection('events')

    console.log('Connected to MongoDB and Redis');
    const buffer = [];

    while (true) {
        try {
            const res = await redis.blPop('github_events_queue', 0)
            const jsonString = res.element
            const event = JSON.parse(jsonString)
            buffer.push(event)

            if (buffer.length >= BATCH_SIZE) {
                await collection.insertMany(buffer)
                console.log(`Inserted ${buffer.length} events`);
                buffer.length = 0
            }
        } catch (error) {
            console.error('consumer error:', err)
            await new Promise(res => setTimeout(res, 1000))
        }
    }

}

startConsumer().catch(console.error)