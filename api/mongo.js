import { MongoClient } from 'mongodb';

const uri = 'mongodb://shabeer:shabeer@127.0.0.1:27017/github?authSource=admin';

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const db = client.db('github');
        const collection = db.collection('events'); // Replace 'github' with your actual collection name
        const firstDoc = await collection.findOne(); // Returns the first document in the collection
        console.log(firstDoc);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
