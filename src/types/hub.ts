export interface GameItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  status: 'ACTIVE' | 'COMING_SOON' | 'BETA';
  genre: string;
  category: 'cards' | 'deduction' | 'party' | 'words';
  playerRange: string;
  estimatedTime: string;
  badge?: string;
  badgeColor?: string;
  accentColor: string;
  iconName: string;
  features: string[];
}

export type HubCategory = 'all' | 'cards' | 'deduction' | 'party' | 'words';

export type HubView =
  | 'hub'
  | 'undercover_mode_select'
  | 'undercover_game'
  | 'spyfall_mode_select'
  | 'spyfall_game'
  | 'bhabhi_mode_select'
  | 'bhabhi_game';
