export interface Clan {
  id: number;
  name: string;
  tag: string;
  description: string | null;
  roster: string | null;
  members: string[];
  logo_url: string | null;
  banner_url?: string | null;
  discord_url?: string | null;
  points: number;
  previous_points: number;
  points_reached_at?: string | null;
  rank: number;
  rank_change: number;
  tier: string;
  is_active: boolean;
}

export interface RatingLog {
  id: number;
  clan_id: number;
  clan_tag?: string | null;
  clan_name?: string | null;
  old_points: number;
  new_points: number;
  delta: number;
  reason: string;
  proof_url: string | null;
  moderator_username: string;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
  is_active: boolean;
}

export type TabId = 'ladder' | 'podium' | 'raids' | 'rules';
