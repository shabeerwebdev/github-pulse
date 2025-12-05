console.error('DEBUG REDIS_URL:', process.env.REDIS_URL);
import axios from "axios";
import { createClient } from "redis";
import zlib from "node:zlib";
import readline from "node:readline";

const FILE_URL = "http://data.githubarchive.org/2024-01-01-15.json.gz";
const REDIS_QUEUE_KEY = "github_events_queue";
const REDIS_PUB_CHANNEL = "live_events";

async function main() {
    console.log('REDIS_URL:', process.env.REDIS_URL);
    const redisUrl = process.env.REDIS_URL && process.env.REDIS_URL.trim() ? process.env.REDIS_URL : 'redis://redis:6379';
    console.error('Using Redis URL:', redisUrl);
    const redis = createClient({ url: redisUrl });
    redis.on("error", (err) => console.log(err));
    await redis.connect();

    const response = await axios({
        url: FILE_URL,
        method: "GET",
        responseType: "stream"
    })

    const gunzipStream = response.data.pipe(zlib.createGunzip());

    const rl = readline.createInterface({
        input: gunzipStream
    })
    let count = 0;
    for await (const line of rl) {
        if (!line.trim()) continue

        try {
            const event = JSON.parse(line)
            await redis.rPush(REDIS_QUEUE_KEY, JSON.stringify(event))
            await redis.publish(REDIS_PUB_CHANNEL, JSON.stringify(event))
            count++
            if (count % 1000 === 0) console.log(`Queued ${count} events...`)
        } catch (error) {
            console.log("Error parsing line");
        }

    }
    console.log(`Finished. Total events queued ${count}`);
    await redis.quit()

}

main().catch(err => console.error(`Ingestion service failed:`, err))