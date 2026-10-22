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
  clan_id: number | null;
  is_active: boolean;
}

export interface Alliance {
  id: number;
  requester_clan_id: number;
  requester_clan_name: string;
  requester_clan_tag: string;
  target_clan_id: number;
  target_clan_name: string;
  target_clan_tag: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export type TabId = 'ladder' | 'podium' | 'raids' | 'rules' | 'alliances';
