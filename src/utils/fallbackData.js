export const FALLBACK_ANALYSES = {
  panaji_vs_margao: {
    teamName: "Panaji Panthers",
    opponent: "Margao Strikers",
    result: "Won",
    format: "T20",
    phase: "Full Match",
    rawScorecard: "Panaji Panthers vs Margao Strikers - T20\nBatting: Rahul 19(28), Vikas 34(21), Suresh 45(40), Karan 8(12), Rohit 28(18)\nTotal: 146/4 (20 overs)\nOver 1: 5 runs, 0 wickets\nOver 2: 8 runs, 0 wickets\nOver 3: 4 runs, 1 wickets\nOver 4: 12 runs, 0 wickets\nOver 5: 6 runs, 0 wickets\nOver 6: 15 runs, 0 wickets\nOver 7: 3 runs, 0 wickets\nOver 8: 9 runs, 0 wickets\nOver 9: 11 runs, 0 wickets\nOver 10: 7 runs, 1 wickets\nOver 11: 5 runs, 0 wickets\nOver 12: 8 runs, 0 wickets\nOver 13: 4 runs, 0 wickets\nOver 14: 14 runs, 1 wickets\nOver 15: 3 runs, 0 wickets\nOver 16: 12 runs, 0 wickets\nOver 17: 6 runs, 0 wickets\nOver 18: 9 runs, 1 wickets\nOver 19: 5 runs, 0 wickets\nOver 20: 10 runs, 0 wickets\nBowling: Dev Kumar 4-0-54-0, Priya 4-0-22-2",
    analysis: {
      team_summary: {
        what_won_lost_match: "Over 14.3 — Vikas dismissed for 34. Required rate jumped from 8.2 to 11.4. Panthers held nerve with Suresh anchoring.",
        strongest_partnership: "Rohit & Suresh — 54 runs, overs 8–14. Stabilised after early collapse.",
        bowling_inefficiency: "Dev Kumar — 4 overs, 54 runs (ER: 13.5). Bowled 3 consecutive death overs.",
        pattern: "Team scores 68% of runs in overs 7–15. Powerplay SR of 89 is below par. Top order needs SR 120+ in overs 1–6."
      },
      players: [
        { name: "Rahul Sharma", role: "Batsman · #3", tag: "Liability",
          what_worked: "Scored 19 off 28 balls. Held crease during middle-over collapse.",
          what_failed: "61% dot ball rate in powerplay — highest in team. SR of 67.8.",
          next_match_instruction: "Drop to #5. SR target: 100+ in powerplay or sit out.",
          practice_drill: "Powerplay aggression nets — 8-ball sequences, zero dot balls." },
        { name: "Vikas Patel", role: "Batsman · #1", tag: "Aggressor",
          what_worked: "34 off 21 balls (SR 161.9). 4 boundaries and 1 six in middle overs.",
          what_failed: "Dismissed softly to a full toss in over 15. Poor shot selection.",
          next_match_instruction: "Promote to #3. Free license to attack spinners in overs 7–12.",
          practice_drill: "Range hitting against slow bowling. Focus on clearing mid-wicket." },
        { name: "Dev Kumar", role: "Bowler · Pace", tag: "Liability",
          what_worked: "Took 1 wicket in his first over. Good length in powerplay.",
          what_failed: "54 runs in 4 overs. ER 13.5 in death — 3 consecutive overs. No variation.",
          next_match_instruction: "Max 2 overs in death. Cap at over 17.",
          practice_drill: "Yorker practice with target cones. Needs 4/6 execution rate." },
        { name: "Suresh Raina", role: "Allrounder · #4", tag: "Anchor",
          what_worked: "45 off 40 balls. 2 tight overs bowled (ER 6.0). Anchored overs 8–16.",
          what_failed: "Only 2 boundaries in overs 10-15. SR dropped to 72 in this phase.",
          next_match_instruction: "Target 1 boundary every 8 balls. No dot balls.",
          practice_drill: "Strike rotation against spinners. Target long-on and long-off." },
        { name: "Karan Nair", role: "Batsman · #5", tag: "Improving",
          what_worked: "Improved technique against pace. Survived 12 balls without an edge.",
          what_failed: "8 off 12 balls. SR 66.7. Zero boundaries. 5 consecutive dots in over 4.",
          next_match_instruction: "Must score 20+ or face being dropped next game.",
          practice_drill: "Short-pitch bowling drills — pull and cut shot practice. 15 mins daily." }
      ],
      coach_decisions: {
        batting_order_change: "Move Rahul from #3 to #5. 61% dot ball rate unsuitable for top order. Vikas promoted to #3.",
        bowling_rotation: "Dev Kumar: max 2 overs in death (cap at over 17). Use Priya's remaining overs in death instead.",
        player_on_notice: "Karan Nair — 3 consecutive single-digit scores. One more failure = dropped.",
        tactical_focus_next_game: "Powerplay SR target 120+ for top 3. Execute or restructure batting order."
      }
    }
  },

  margao_vs_vasco: {
    teamName: "Margao Strikers",
    opponent: "Vasco Warriors",
    result: "Lost",
    format: "T20",
    phase: "Death Overs",
    rawScorecard: "Margao Strikers vs Vasco Warriors - T20\nBatting: Amit 12(15), Rohan 44(38), Jay 31(28), Priya 6(9), Sanjay 22(20)\nTotal: 128/6 (20 overs)\nVasco scored 132/3 in 18.4 overs",
    analysis: {
      team_summary: {
        what_won_lost_match: "Death overs collapse — 18 runs in overs 16–20 while losing 3 wickets. Lost by 4 runs.",
        strongest_partnership: "Rohan & Jay — 62 runs, overs 5–13. Good platform but couldn't accelerate.",
        bowling_inefficiency: "Sanjay Kumar — 3 overs, 38 runs (ER: 12.7). 4 boundaries conceded in powerplay.",
        pattern: "Consistent death collapse. Last 3 matches: 18, 22, 26 runs in overs 16–20."
      },
      players: [
        { name: "Rohan Verma", role: "Batsman · #2", tag: "Anchor",
          what_worked: "44 off 38 balls. Only player to cross 30. Smart rotation in middle overs.",
          what_failed: "SR 115.8 in death not enough when chasing 8+ per over. 1 boundary in last 12 balls.",
          next_match_instruction: "Must shift gears at over 15. Target SR 140+ in final 5 overs.",
          practice_drill: "Death over simulation — 12-ball sets needing 18+ runs. Practice sixes." },
        { name: "Jay Patel", role: "Allrounder · #3", tag: "Improving",
          what_worked: "31 off 28 balls. 2 overs bowled for 14 runs. Both bat and ball.",
          what_failed: "Dismissed attempting reverse sweep vs pace in over 14. Poor shot selection.",
          next_match_instruction: "No reverse sweeps vs pace. Stick to conventional shots.",
          practice_drill: "Scenario batting — practice building under match-pressure simulations." },
        { name: "Amit Shah", role: "Bowler · Medium", tag: "Anchor",
          what_worked: "4 overs for 28 runs (ER 7.0). Tight lines outside off. 1 key wicket in over 8.",
          what_failed: "12 off 15 balls opening. SR 80 in powerplay put team behind from start.",
          next_match_instruction: "Focus on bowling. Batting SR must be 120+ in first 3 overs.",
          practice_drill: "Powerplay batting — 6-ball sets targeting specific zones. Min 8 runs/set." },
        { name: "Priya Desai", role: "Bowler · Spin", tag: "Liability",
          what_worked: "Economy 5.5 in middle overs. Held one end tight for 3 overs.",
          what_failed: "6 off 9 balls at #6. Came in at over 16, SR 66.7. 4 dot balls.",
          next_match_instruction: "Bat at #8 or lower. Cannot bat under pressure. Focus on bowling.",
          practice_drill: "Quick singles — no big shots in nets. Target zero dot balls." },
        { name: "Sanjay Kumar", role: "Allrounder · #5", tag: "Liability",
          what_worked: "22 off 20 balls. 2 sixes showing intent in middle overs.",
          what_failed: "Bowling: 3 overs, 38 runs (ER 12.7). Only length balls. Got out in over 17.",
          next_match_instruction: "Drop from bowling. Use as pure batsman at #5.",
          practice_drill: "Death finishing — practice chasing 10-15 off last over." }
      ],
      coach_decisions: {
        batting_order_change: "Priya to #8. Sanjay to #4 as designated hitter. Rohan stays at #2 with clear acceleration at over 15.",
        bowling_rotation: "Drop Sanjay from bowling (ER 12.7). Amit Shah opens bowling with full 4 overs upfront.",
        player_on_notice: "Priya Desai (batting) — 6, 8, 4 in last 3 innings. One more failure = dropped despite bowling.",
        tactical_focus_next_game: "Death overs finishing: must score 35+ in overs 16–20. Practice 5-over simulations daily."
      }
    }
  },

  vasco_vs_ponda: {
    teamName: "Vasco Warriors",
    opponent: "Ponda Eagles",
    result: "Won",
    format: "T20",
    phase: "Powerplay",
    rawScorecard: "Vasco Warriors vs Ponda Eagles - T20\nBatting: Arjun 52(36), Deepak 28(22), Vikram 18(14), Nikhil 35(30), Prasad 15(10)\nTotal: 162/5 (20 overs)\nPonda scored 141/8 in 20 overs",
    analysis: {
      team_summary: {
        what_won_lost_match: "Arjun's 52 off 36 set the tone — 38 runs in first 6 overs. Ponda never recovered from RR 8.1 after PP.",
        strongest_partnership: "Arjun & Deepak — 68 runs in first 8 overs. 9 boundaries in powerplay.",
        bowling_inefficiency: "Prasad — 2 overs, 24 runs (ER: 12.0). Bowled in middle overs instead of spinners.",
        pattern: "PP SR improved to 138 (from 89 three matches ago). Middle overs SR 105 needs same treatment."
      },
      players: [
        { name: "Arjun Naik", role: "Batsman · Opener", tag: "Aggressor",
          what_worked: "52 off 36 (SR 144.4). 7 fours, 2 sixes. Dominated PP with 38 runs in 6 overs.",
          what_failed: "Tired shot in over 12 — miscued pull to mid-on. Could have converted to 70+.",
          next_match_instruction: "Continue opening. Target: bat minimum 10 overs. Conversion rate needs work.",
          practice_drill: "Extended 50-ball sets. Focus on maintaining intensity after powerplay." },
        { name: "Deepak Shetty", role: "Batsman · Opener", tag: "Aggressor",
          what_worked: "28 off 22 (SR 127.3). Perfect complement — attacked spinners while Arjun targeted pace.",
          what_failed: "Dismissed by slower ball in over 8. Got out to them 3 times in 5 matches.",
          next_match_instruction: "Stay at opening. Work on slower ball detection urgently.",
          practice_drill: "Mixed pace deliveries with random slower balls. Bowling machine drills." },
        { name: "Vikram Dessai", role: "Bowler · Pace", tag: "Anchor",
          what_worked: "4 overs for 22 runs (ER 5.5). 2 wickets including their best batsman.",
          what_failed: "18 off 14 balls — only 1 boundary. Could accelerate more at #3.",
          next_match_instruction: "Bowling is primary role. Batting: target 1 boundary every 6 balls.",
          practice_drill: "Outswing with new ball — develop into consistent weapon." },
        { name: "Nikhil Kamat", role: "Batsman · #4", tag: "Anchor",
          what_worked: "35 off 30 balls. Stabilised after openers departed. 3 boundaries through covers.",
          what_failed: "SR 116.7 acceptable but not game-changing. 8 off last 8 balls in death.",
          next_match_instruction: "Excellent #4. Target SR 130+ in overs 16–20.",
          practice_drill: "Death acceleration vs yorkers and full-length. Leg-side hitting." },
        { name: "Prasad Gaonkar", role: "Allrounder · #5", tag: "Improving",
          what_worked: "15 off 10 at death. Crucial six in 19th over pushed total past 160.",
          what_failed: "Bowling: 2 overs, 24 runs (ER 12.0). Wrong phase — should bowl PP only.",
          next_match_instruction: "Finish at #5. Bowl only in PP if needed.",
          practice_drill: "Death finishing — 6-ball sets needing 12+ runs." }
      ],
      coach_decisions: {
        batting_order_change: "No changes — top 4 working. Arjun & Deepak open. Nikhil anchors #4, Prasad finishes #5.",
        bowling_rotation: "Prasad max 1 over in PP only. Middle overs: use spin. Vikram gets full 4 — most economical bowler.",
        player_on_notice: "Prasad (bowling) — ER 12.0 too expensive. Needs 2 games under ER 8.0 or loses bowling spot.",
        tactical_focus_next_game: "Maintain PP aggression (SR 138+). Fix middle overs to SR 120+ in overs 7–14."
      }
    }
  },

  get demo_live() {
    return this.panaji_vs_margao.analysis;
  }
};
