export type PerformanceTag = "Aggressor" | "Anchor" | "Improving" | "Liability";

export interface PlayerAnalysis {
  name: string;
  role: string;
  position: string;
  tag: PerformanceTag;
  whatWorked: string;
  whatFailed: string;
  nextMatch: string;
  drill: string;
}

export interface TeamReport {
  turningPoint: string;
  strongestPartnership: string;
  bowlingInefficiency: string;
  scoringPattern: string;
}

export interface CoachBrief {
  battingOrder: string;
  bowlingRotation: string;
  playerOnNotice: string;
  tacticalFocus: string;
}

export interface FullAnalysis {
  players: PlayerAnalysis[];
  teamReport: TeamReport;
  coachBrief: CoachBrief;
}

export interface MappedPlayerAnalysis {
  name: string;
  role: string;
  tag: PerformanceTag;
  key_stat: string;
  match_impact: string;
  what_worked: string;
  what_failed: string;
  next_match_instruction: string;
  practice_drill: string;
}

export interface MappedTeamSummary {
  what_won_lost_match: string;
  strongest_partnership: string;
  bowling_inefficiency: string;
  pattern: string;
}

export interface MappedCoachDecisions {
  batting_order_change: string;
  bowling_rotation: string;
  player_on_notice: string;
  tactical_focus_next_game: string;
}

export interface MappedAnalysisResult {
  shareId: string | null;
  players: MappedPlayerAnalysis[];
  team_summary: MappedTeamSummary;
  coach_decisions: MappedCoachDecisions;
}
