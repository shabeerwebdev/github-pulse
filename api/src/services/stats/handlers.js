/**
 * Stats API Request Handlers
 */

import { getDb } from '../../core/mongo.js';
import logger from '../../core/logger.js';

/**
 * GET /api/overview
 * Returns total events, active users, and total commits
 */
export async function getOverview(req, res) {
    try {
        const db = getDb();
        const events = db.collection('events');

        const [totalEvents, uniqueUsers, commits] = await Promise.all([
            events.countDocuments(),
            events.distinct('actor.login'),
            events.aggregate([
                { $match: { type: 'PushEvent' } },
                { $group: { _id: null, commits: { $sum: '$payload.size' } } }
            ]).toArray()
        ]);

        res.json({
            total_events: totalEvents,
            total_users: uniqueUsers.length,
            total_commits: commits[0]?.commits || 0
        });
    } catch (error) {
        logger.error('Error fetching overview', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch overview' });
    }
}

/**
 * GET /api/top-repos
 * Returns top 10 repositories by event count
 */
export async function getTopRepos(req, res) {
    try {
        const db = getDb();
        const data = await db.collection('events').aggregate([
            { $group: { _id: '$repo', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]).toArray();

        res.json(data);
    } catch (error) {
        logger.error('Error fetching top repos', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch top repos' });
    }
}

/**
 * GET /api/activity
 * Returns activity grouped by minute
 */
export async function getActivity(req, res) {
    try {
        const db = getDb();
        const data = await db.collection('events').aggregate([
            { $project: { minute: { $minute: { $toDate: '$created_at' } } } },
            { $group: { _id: '$minute', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]).toArray();

        res.json(data);
    } catch (error) {
        logger.error('Error fetching activity', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
}
