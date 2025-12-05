import React from 'react';
import { GitHubEvent, EventType } from '../types';
import { GitCommit, GitPullRequest, AlertCircle, Eye, GitFork, Star, Activity } from 'lucide-react';

interface LiveFeedProps {
  events: GitHubEvent[];
  connectionStatus: boolean;
}

const getEventIcon = (type: string) => {
  switch (type) {
    case EventType.PushEvent: return <GitCommit className="w-4 h-4 text-emerald-400" />;
    case EventType.PullRequestEvent: return <GitPullRequest className="w-4 h-4 text-purple-400" />;
    case EventType.IssuesEvent: return <AlertCircle className="w-4 h-4 text-orange-400" />;
    case EventType.WatchEvent: return <Star className="w-4 h-4 text-yellow-400" />;
    case EventType.ForkEvent: return <GitFork className="w-4 h-4 text-blue-400" />;
    case EventType.CreateEvent: return <Activity className="w-4 h-4 text-green-400" />;
    default: return <Eye className="w-4 h-4 text-gray-400" />;
  }
};

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const LiveFeed: React.FC<LiveFeedProps> = ({ events, connectionStatus }) => {
  return (
    <div className="flex flex-col h-full bg-dashboard-card border border-dashboard-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-dashboard-border flex justify-between items-center bg-slate-900/50">
        <h3 className="font-semibold text-dashboard-text flex items-center gap-2">
          <Activity className="w-5 h-5 text-dashboard-accent" />
          Live Event Feed
        </h3>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connectionStatus ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
          <span className="text-xs text-dashboard-muted uppercase tracking-wider">
            {connectionStatus ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {events.length === 0 ? (
          <div className="text-center text-dashboard-muted py-10 opacity-50">
            Waiting for events...
          </div>
        ) : (
          events.map((event, index) => (
            <div 
              key={`${event.actor.login}-${event.created_at}-${index}`}
              className="group flex items-start gap-3 p-3 rounded-md hover:bg-slate-800/50 border border-transparent hover:border-slate-700 transition-all duration-200 animate-[fadeIn_0.3s_ease-out]"
            >
              <img 
                src={event.actor.avatar_url} 
                alt={event.actor.login} 
                className="w-8 h-8 rounded-full border border-slate-700"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-dashboard-text truncate">
                    {event.actor.login}
                  </p>
                  <span className="text-xs text-dashboard-muted font-mono whitespace-nowrap ml-2">
                    {formatTime(event.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {getEventIcon(event.type)}
                  <p className="text-xs text-dashboard-muted truncate">
                    <span className="text-slate-300">{event.type.replace('Event', '')}</span> on <span className="text-dashboard-accent">{event.repo.name}</span>
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};