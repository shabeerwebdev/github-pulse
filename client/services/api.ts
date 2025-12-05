import { API_BASE_URL } from '../constants';
import { OverviewStats, RepoStat, ActivityStat } from '../types';

export const fetchOverview = async (): Promise<OverviewStats> => {
  try {
    const res = await fetch(`/api/overview`);
    if (!res.ok) throw new Error('Failed to fetch overview');
    return await res.json();
  } catch (error) {
    console.error(error);
    // Return fallback data to prevent crash if backend is offline during demo
    return { total_events: 0, total_users: 0, total_commits: 0 };
  }
};

export const fetchTopRepos = async (): Promise<RepoStat[]> => {
  try {
    const res = await fetch(`/api/top-repos`);
    if (!res.ok) throw new Error('Failed to fetch top repos');
    const data = await res.json();
    // Map _id to repo name if _id is an object
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        _id: typeof item._id === 'object' && item._id !== null ? item._id.name : (item._id || 'Unknown'),
        count: Number(item.count) || 0
      }));
    }
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchActivity = async (): Promise<ActivityStat[]> => {
  try {
    const res = await fetch(`/api/activity`);
    if (!res.ok) throw new Error('Failed to fetch activity');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};