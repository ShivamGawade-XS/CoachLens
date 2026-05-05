export const FALLBACK_ANALYSES = {
  demo_live: {
    team_summary: {
      what_won_lost_match: "Over 14.3 — Vikas dismissed for 34. Required rate jumped from 8.2 to 11.4. Match effectively over from this point.",
      strongest_partnership: "Rohit & Suresh — 54 runs, overs 8–14",
      bowling_inefficiency: "Dev Kumar — 4 overs, 54 runs (ER: 13.5). Bowled 3 consecutive overs in the death.",
      pattern: "Team scores 68% of runs in overs 7–15. Powerplay avg SR of 89 is below par for this format. Top order needs to target SR 120+ in overs 1–6."
    },
    players: [
      {
        name: "Rahul Sharma",
        role: "Batsman",
        tag: "Liability",
        what_worked: "Scored 19 off 28 balls. Held crease during collapse.",
        what_failed: "61% dot ball rate in powerplay. Highest in team. SR of 67.8.",
        next_match_instruction: "Drop to #5. SR target: 100+ in powerplay or sit out.",
        practice_drill: "Powerplay aggression nets — 8-ball sequences, no dot balls."
      },
      {
        name: "Vikas Patel",
        role: "Batsman",
        tag: "Aggressor",
        what_worked: "Scored 34 off 21 balls. Hit 4 boundaries in middle overs.",
        what_failed: "Dismissed softly to a full toss in the 15th over.",
        next_match_instruction: "Promote to #3. Given free license to attack spinners.",
        practice_drill: "Range hitting against slow bowling in the death overs."
      },
      {
        name: "Dev Kumar",
        role: "Bowler",
        tag: "Liability",
        what_worked: "Took 1 wicket in his first over.",
        what_failed: "Leaked 54 runs in 4 overs. ER 13.5 in the death.",
        next_match_instruction: "Maximum 2 overs in death. Cap at over 17.",
        practice_drill: "Yorker practice with target cones. Needs 4/6 execution rate."
      },
      {
        name: "Suresh Raina",
        role: "Allrounder",
        tag: "Anchor",
        what_worked: "Stable 45 off 40 balls. Bowled 2 tight overs (ER 6.0).",
        what_failed: "Slowed down between overs 10-15. Only 2 boundaries.",
        next_match_instruction: "Maintain anchor role but look for singles every ball.",
        practice_drill: "Strike rotation against spinners. Target long-on and long-off."
      }
    ],
    coach_decisions: {
      batting_order_change: "Move Rahul from #3 to #5. 61% dot ball rate makes him unsuitable for top order in powerplay.",
      bowling_rotation: "Dev Kumar: max 2 overs in death (cap at over 17). ER of 13.5 in overs 17–20 is unsustainable.",
      player_on_notice: "Karan Nair — 3 consecutive single-digit scores. One more similar performance = dropped.",
      tactical_focus_next_game: "Powerplay SR target 120+ for top 3. Execute or restructure batting order next week."
    }
  }
};
