import React, { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Activity, GitCommit, Users, Server, Box } from 'lucide-react';
import { OverviewStats, RepoStat, ActivityStat, GitHubEvent } from './types';
import { SOCKET_URL } from './constants';
import { fetchOverview, fetchTopRepos, fetchActivity } from './services/api';

import { StatCard } from './components/StatCard';
import { TopReposChart, ActivityChart } from './components/Charts';
import { LiveFeed } from './components/LiveFeed';

const App: React.FC = () => {
  // State for REST API Data
  const [overview, setOverview] = useState<OverviewStats>({ total_events: 0, total_users: 0, total_commits: 0 });
  const [topRepos, setTopRepos] = useState<RepoStat[]>([]);
  const [activityData, setActivityData] = useState<ActivityStat[]>([]);
  
  // State for WebSocket Data
  const [recentEvents, setRecentEvents] = useState<GitHubEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Initial Data Fetch
  const loadDashboardData = useCallback(async () => {
    try {
      const [overviewData, reposData, activityChartData] = await Promise.all([
        fetchOverview(),
        fetchTopRepos(),
        fetchActivity()
      ]);
      setOverview(overviewData);
      setTopRepos(reposData);
      setActivityData(activityChartData);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    // Optional: Poll REST API every minute to keep stats relatively fresh
    const interval = setInterval(loadDashboardData, 60000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // WebSocket Connection
  useEffect(() => {
    const socket: Socket = io('/', { path: '/socket.io' });

    socket.on('connect', () => {
      console.log('Socket Connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket Disconnected');
      setIsConnected(false);
    });

    socket.on('github_event', (newEvent: GitHubEvent) => {
      setRecentEvents((prevEvents) => {
        const updated = [newEvent, ...prevEvents];
        // Keep max 20 items
        return updated.slice(0, 20);
      });
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-dashboard-bg text-dashboard-text p-4 md:p-6 lg:h-screen lg:overflow-hidden flex flex-col">
      {/* Header */}
      <header className="mb-6 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="text-dashboard-accent" />
            GitHub Pulse
          </h1>
          <p className="text-dashboard-muted text-sm mt-1">Real-time ecosystem analytics</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
              <p className="text-xs text-dashboard-muted">Server Status</p>
              <p className={`text-sm font-bold ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isConnected ? 'ONLINE' : 'RECONNECTING'}
              </p>
           </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left Column: Stats & Charts */}
        <div className="flex-1 flex flex-col gap-6 min-h-0 overflow-y-auto lg:overflow-visible">
          
          {/* Top Row: KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
            <StatCard 
              title="Total Events" 
              value={overview.total_events} 
              icon={Server} 
              colorClass="text-indigo-400" 
            />
            <StatCard 
              title="Active Users" 
              value={overview.total_users} 
              icon={Users} 
              colorClass="text-emerald-400" 
            />
            <StatCard 
              title="Total Commits" 
              value={overview.total_commits} 
              icon={GitCommit} 
              colorClass="text-amber-400" 
            />
          </div>

          {/* Middle Row: Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
            {/* Top Repos */}
            <div className="bg-dashboard-card border border-dashboard-border rounded-lg p-6 flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-dashboard-text flex items-center gap-2">
                  <Box className="w-5 h-5 text-dashboard-muted" />
                  Top Repositories
                </h3>
              </div>
              <div className="flex-1 relative">
                {topRepos.length > 0 ? (
                  <TopReposChart data={topRepos} />
                ) : (
                  <div className="flex items-center justify-center h-full text-dashboard-muted">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Activity Over Time */}
            <div className="bg-dashboard-card border border-dashboard-border rounded-lg p-6 flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-dashboard-text flex items-center gap-2">
                  <Activity className="w-5 h-5 text-dashboard-muted" />
                  Activity Volume (Last Hour)
                </h3>
              </div>
              <div className="flex-1 relative">
                 {activityData.length > 0 ? (
                   <ActivityChart data={activityData} />
                 ) : (
                    <div className="flex items-center justify-center h-full text-dashboard-muted">
                      No data available
                    </div>
                 )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (or Bottom on Mobile): Live Feed */}
        <div className="w-full lg:w-96 shrink-0 lg:h-full min-h-[500px]">
          <LiveFeed events={recentEvents} connectionStatus={isConnected} />
        </div>
      </div>
    </div>
  );
};

export default App;