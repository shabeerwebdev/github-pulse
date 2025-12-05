export interface OverviewStats {
  total_events: number;
  total_users: number;
  total_commits: number;
}

export interface RepoStat {
  _id: string; // Repository name
  count: number;
}

export interface ActivityStat {
  _id: number; // Minute 0-59
  count: number;
}

export interface GitHubActor {
  login: string;
  avatar_url: string;
}

export interface GitHubRepo {
  name: string;
}

export interface GitHubEvent {
  type: string;
  actor: GitHubActor;
  repo: GitHubRepo;
  created_at: string;
}

// Map for event type colors/icons
export enum EventType {
  PushEvent = 'PushEvent',
  PullRequestEvent = 'PullRequestEvent',
  IssuesEvent = 'IssuesEvent',
  WatchEvent = 'WatchEvent',
  ForkEvent = 'ForkEvent',
  CreateEvent = 'CreateEvent',
}