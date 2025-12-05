/**
 * Stats API Routes
 */

import { Router } from 'express';
import * as handlers from './handlers.js';

const router = Router();

// Overview stats (total events, users, commits)
router.get('/overview', handlers.getOverview);

// Top repositories by event count
router.get('/top-repos', handlers.getTopRepos);

// Activity timeline by minute
router.get('/activity', handlers.getActivity);

export { router as statsRoutes };
