# Product Requirements Document (PRD)
# CoachLens — AI Coaching Intelligence for Amateur Cricket

**Version:** 1.0  
**Authors:** Crimson Syndicate (Shivam Mahesh Gawade, Ashwith Ashok Shetty, Rahul Ravi Rathod)  
**Hackathon:** GBOA Code Premier League 2026 — Round 2  
**Institution:** Agnel Institute of Technology and Design (AITD), Goa University  
**Last Updated:** May 2026

---

## 1. Product Overview

### 1.1 Product Name
**CoachLens**

### 1.2 Tagline
*Paste your scorecard. Get a full coaching brief in 30 seconds.*

### 1.3 Product Summary
CoachLens is an AI-powered post-match analysis assistant built for amateur cricket coaches and team captains. It transforms raw scorecard data into structured, actionable coaching intelligence — player-by-player performance tags, team pattern reports, and pre-match decision briefs — in under 30 seconds.

CoachLens is not a scoreboard, stats tracker, or fantasy platform. It is the **intelligence layer** between raw match data and actual coaching decisions.

### 1.4 Problem Statement
Amateur cricket coaches in India have no analytical tools. Platforms like CricHeroes provide scoreboard data but zero interpretive context. After every local match, coaches deliver generic, vague feedback — *"bat better, bowl tighter"* — because they lack the tools to do otherwise.

This gap affects **3 lakh+ registered amateur cricket teams** across India. IPL franchises spend lakhs on coaching analytics; grassroots coaches get nothing.

**The specific unmet need:**
- Why exactly did we lose? (Over-level breakdown)
- Who needs to change what? (Player-level, number-backed)
- What do I tell each player at tomorrow's practice?
- What are my selection and batting order decisions for next match?

### 1.5 Product Vision
Give every amateur cricket coach in a tier-2/tier-3 Indian city the same analytical edge that IPL franchises pay lakhs for — free, instant, and actionable.

---

## 2. Target Users

### 2.1 Primary User
**Amateur cricket coach or team captain** running a local T20 league side in tier-2/tier-3 cities across India.

**User Profile:**
| Attribute | Detail |
|---|---|
| Team size | 10–15 players per side |
| Match frequency | 1–3 matches per week |
| Analytical background | None |
| Current tools | WhatsApp groups, CricHeroes (scorecard only) |
| Decision-making process | Gut feeling and experience |
| Biggest frustration | "I look at the scorecard and I still don't know what to tell them." |

### 2.2 Secondary User
**Amateur cricket players** who receive individual shareable feedback cards via link — private, personalised, and not publicly posted.

---

## 3. Core Features

### 3.1 Feature 1 — Smart Scorecard Input
**Priority:** P0 (MVP)

- Paste raw text scorecard directly into input field
- Manual per-player stat entry as fallback
- Format selection: T20 / ODI
- Match phase focus: Powerplay / Middle Overs / Death Overs
- Basic input validation with user-friendly error messages

**Acceptance Criteria:**
- Coach can paste a standard CricHeroes-style scorecard and proceed to analysis within 60 seconds
- System handles incomplete data gracefully with "insufficient data" flags rather than errors
- Minimum viable input: 5 players with at least one batting or bowling stat each

---

### 3.2 Feature 2 — Player Intelligence Cards
**Priority:** P0 (MVP)

For every player in the scorecard, the AI generates a colour-coded intelligence card containing:

| Field | Description |
|---|---|
| **Performance Tag** | Anchor / Aggressor / Liability / Improving |
| **Intent Score** | 1-10 pure-client gauge scoring player effort/intent |
| **Pressure Index** | Badge identifying 'Clutch' vs 'Pressure Risk' behavior |
| **What Worked** | Specific, number-backed observation |
| **What Failed** | Specific, number-backed observation |
| **Next Match Instruction** | One concrete, actionable change |
| **Practice Drill** | One specific drill or exercise |

**Tag Colour Coding:**
- 🟢 Green — Aggressor
- 🔵 Blue — Anchor
- 🟡 Yellow — Improving
- 🔴 Red — Liability

**Example Output:**
> "Rahul (Batting) — Liability in Powerplay. Faced 28 balls for 19 runs in first 6 overs. Dot ball % of 61% is highest in the team. Recommendation: Drop to #4, use as stabilizer in overs 7–15. Drill: Powerplay aggression nets with 8-ball sequences."

**Acceptance Criteria:**
- Every insight references a specific number from the scorecard
- No vague language ("improve consistency", "bat better") in any card
- Cards render within 10 seconds of analysis trigger
- Insufficient data flagged explicitly rather than guessed

---

### 3.3 Feature 3 — Team Pattern Report
**Priority:** P0 (MVP)

A single-page team-level analysis identifying:

- **Match Turning Point:** Exact over and event where momentum shifted
- **Strongest Partnership:** Player names and run contribution
- **Bowling Inefficiency:** Which bowler, which overs, what went wrong
- **Scoring Pattern vs Par:** Team run rate against expected par score

**Acceptance Criteria:**
- Report generated from same AI call as player cards (no additional user action)
- All observations reference specific data points from scorecard
- Presented as a scannable, one-screen summary

---

### 3.4 Feature 4 — Coach Decision Brief
**Priority:** P0 (MVP)

Pre-match intelligence document covering decisions and tactical flaws:

1. **AI Toss Advisor** — Analyzes past win/loss records when batting vs fielding first to recommend a Toss decision.
2. **Tactical Mismatch Warnings** — Flags logical errors like using Anchors at #8 or Liability bowlers in death overs.
3. **Selection Call** — Who earned their spot; who is on notice and why
4. **Batting Order Adjustment** — Specific positional swap with number-backed reason
5. **Bowling Rotation Suggestion** — Specific change with reason
6. **One Tactical Focus** — Single sentence priority for next match

**Acceptance Criteria:**
- Decisions are concrete and specific (e.g., "Move Rahul from #3 to #5; his powerplay dot ball % of 61% makes him unsuitable for top order")
- No generic motivational language
- Brief fits on one screen without scrolling

---

### 3.5 Feature 5 — WhatsApp Coach Integration
**Priority:** P0 (MVP)

- "Send to Player" button on every card opens a WhatsApp modal.
- LLM generates a personalized, 2-sentence feedback message based on the player's tag and stats.
- Opens native WhatsApp Web/App pre-filled with the message.

---

### 3.6 Feature 6 — Season Form Engine
**Priority:** P0 (MVP)

- Dashboard table aggregating consistency across all stored matches.
- **Clutch Factor:** Flags "Big Match Players" (better in losses) vs "Frontrunners" (only perform in wins).
- **Trend Indicators:** Shows if a player's last 2 matches are trending up, down, or flat.

**Acceptance Criteria:**
- Link generates from individual player card in one click
- Shareable card renders correctly on mobile (WhatsApp preview compatible)
- Player cannot see other players' cards via their link

---

### 3.6 Feature 6 — Match History Dashboard
**Priority:** P1 (Post-MVP)

- List of previously analysed matches with results
- Quick-access to past Player Cards and Coach Briefs
- No account required for MVP (localStorage); Supabase for persistence in Phase 2

---

## 4. User Journey (6 Steps)

```
STEP 1 — Open CoachLens after match
         Coach opens web app on phone or laptop.
         Sees match history dashboard.
         
STEP 2 — Enter Scorecard
         Paste scorecard or enter per-player stats.
         Select format (T20) and phase focus (Powerplay).
         
STEP 3 — Hit Analyze
         Single button. AI processes in under 10 seconds.
         
STEP 4 — View Player Intelligence Cards
         Colour-coded cards per player.
         Each card has specific feedback + one action item.
         
STEP 5 — View Team Pattern Report
         One-page summary: where exactly did we lose?
         
STEP 6 — Read Coach Decision Brief
         Three decisions: batting order, bowling rotation,
         tactical focus. Ready to implement next match.
         
STEP 7 — Share with Players  [Optional]
         Generate shareable card per player.
         Coach sends link individually.
```

---

## 5. Out of Scope (v1.0)

| Excluded Feature | Reason |
|---|---|
| Live scoring / ball-by-ball tracking | Separate product category; not post-match coaching |
| Opposition team analysis | Requires opposition data not available in paste-flow |
| Video analysis | Infrastructure cost; out of scope for hackathon |
| Fantasy cricket integration | Different user intent |
| Public player profiles | Privacy risk; not requested by target user |
| Pitch/weather condition analysis | Data not available in scorecard input |

---

## 6. Success Metrics

| Metric | Target (Month 1) |
|---|---|
| Analyses completed | 500+ |
| Coach retention (2nd analysis) | 40%+ |
| Time-to-insight after paste | < 30 seconds |
| Shareable cards generated | 200+ |
| Coach satisfaction score (survey) | 8/10+ |

---

## 7. Monetisation

### 7.1 Model: Freemium

**Free Tier (Forever):**
- Single match analysis
- Basic player cards
- Team pattern report

**Paid Tier — Rs. 99/team/month:**
- Multi-match trend tracking
- Player shareable cards
- Full Coach Decision Brief history
- Export to PDF

### 7.2 Market Sizing

| Parameter | Figure |
|---|---|
| Registered amateur cricket teams in India | 3,00,000+ |
| Target conversion rate (Year 1) | 1% |
| Paying teams | 3,000 |
| MRR at Rs. 99/team | Rs. 2,97,000 |
| ARR | Rs. 35,64,000 |

---

## 8. Phased Roadmap

### Phase 1 — MVP (Hackathon / Week 1)
- Smart scorecard input (paste + manual)
- Player Intelligence Cards
- Team Pattern Report
- Coach Decision Brief
- Pre-seeded demo data

### Phase 2 — Month 1–3
- CricHeroes API integration (auto scorecard import)
- Mobile-responsive PWA
- Player shareable cards
- Supabase persistence (match history)
- Multi-sport support (football, kabaddi)

### Phase 3 — Month 4–6
- Player performance profiles across full season
- Opposition analysis (if both teams use CoachLens)
- Coach-to-player messaging within app
- Export to PDF

---

## 9. Constraints & Risks

| Risk | Mitigation |
|---|---|
| Groq API rate limit hit during demo | Pre-cached fallback AI response ready |
| Scorecard format inconsistency | Liberal input parsing; manual entry fallback |
| Low data quality (5-player entries) | "Insufficient data" flags rather than bad guesses |
| CricHeroes API not public yet | Phase 2 feature; paste flow covers Phase 1 entirely |
| Coach not tech-savvy | WhatsApp-friendly share; one-button flow; zero onboarding required |
