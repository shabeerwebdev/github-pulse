import express from 'express'
import cors from 'cors'
const app = express()
const router = express.Router()
import { MongoClient } from "mongodb"
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/github'
const client = new MongoClient(mongoUrl)
await client.connect()
const db = client.db('github')


app.use(cors());
app.use((req, res, next) => {
    req.db = db
    next()
})

app.use('/api', router)
router.get('/top-repos', async (req, res) => {
    const data = await req.db.collection('events').aggregate([
        { $group: { _id: '$repo', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]).toArray()
    res.json(data)
})

router.get('/activity', async (req, res) => {
    const data = await req.db.collection('events').aggregate([
        { $project: { minute: { $minute: { $toDate: "$created_at" } } } },
        { $group: { _id: "$minute", count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]).toArray();

    res.json(data);
});

router.get('/overview', async (req, res) => {
    const events = req.db.collection('events')
    const totalEvents = await events.countDocuments()
    const uniqueUsers = await events.distinct('actor.login')
    const totalUsers = uniqueUsers.length
    const commits = await events.aggregate([
        { $match: { type: 'PushEvent' } },
        { $group: { _id: null, commits: { $sum: '$payload.size' } } },
    ]).toArray()
    const totalCommits = commits[0]?.commits || 0

    res.json({
        total_events: totalEvents,
        total_users: totalUsers,
        total_commits: totalCommits
    })
})


app.listen(3000, () => console.log('listening now'))