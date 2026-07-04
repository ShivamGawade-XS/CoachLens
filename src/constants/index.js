/**
 * CoachLens Constants Configuration
 */

export const GROQ_MODEL = 'llama-3.1-8b-instant';

export const GROQ_TEMPERATURE = {
  TURNING_POINT: 0.2,
  WHATSAPP: 0.4,
  TOSS: 0.3,
  CHAT: 0.5,
  REPORT: 0.3,
  TACTICAL: 0.3,
  BEST_XI: 0.3
};

export const STORAGE_KEYS = {
  PLAYERS: 'coachlens_players',
  MATCHES: 'coachlens_matches',
  SEEDED: 'coachlens_seeded',
  PLAYERS_SEEDED: 'coachlens_players_seeded',
  SAMPLE_PATCH: 'coachlens_sample_patch_v2',
  SESSION: 'coachlens_session',
  USERS: 'coachlens_users',
  SYS_KEY: 'coachlens_sys_k',
  TEAMS_PREFIX: 'coachlens_teams_',
  SETTINGS_PREFIX: 'coachlens_settings_',
  PLAN_STATUS_KEY: 'coachlens_plan_status',
  ANALYSIS_COUNT: 'coachlens_analysis_count'
};

export const MATCH_FORMATS = ['T20', 'ODI'];

export const PHASE_OPTIONS = ['Full Match', 'Powerplay', 'Middle Overs', 'Death Overs'];

export const TONE_OPTIONS = ['Direct', 'Encouraging', 'Brutal Honest'];

export const FREE_LIMIT = 3;
