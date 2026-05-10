# Product Requirements Document (PRD)
# CoachLens — AI Dugout Intelligence for Amateur Cricket

**Version:** 2.0  
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
CoachLens is an AI-powered **dugout intelligence platform** for amateur cricket coaches. It started as a post-match analysis tool and has evolved into a comprehensive real-time coaching ecosystem — covering everything from ball-by-ball live advice during a match, to tournament squad rotation planning, to shareable Instagram graphics that drive viral growth.

CoachLens is not a scoreboard, stats tracker, or fantasy platform. It is the **intelligence layer** between raw match data and actual coaching decisions — before, during, and after every match.

### 1.4 Problem Statement
Amateur cricket coaches in India have no analytical tools. Platforms like CricHeroes provide scoreboard data but zero interpretive context. After every local match, coaches deliver generic, vague feedback — *"bat better, bowl tighter"* — because they lack the tools to do otherwise.

This gap affects **3 lakh+ registered amateur cricket teams** across India. IPL franchises spend lakhs on coaching analytics; grassroots coaches get nothing.

**The specific unmet needs (v2.0 expanded):**
- Why exactly did we lose? (Over-level breakdown with charts)
- Who needs to change what? (Player-level, number-backed)
- What do I tell each player at tomorrow's practice?
- What are my selection and batting order decisions for next match?
- **[NEW]** What should I do RIGHT NOW, mid-match after over 8?
- **[NEW]** Which 11 players should I pick for this specific opponent?
- **[NEW]** Who chokes in knockouts vs who performs?
- **[NEW]** How do I rotate my squad across a 5-match tournament without burning out my pace attack?

### 1.5 Product Vision
Give every amateur cricket coach in a tier-2/tier-3 Indian city the same analytical edge that IPL franchises pay lakhs for — free, instant, actionable, and available at every stage of the match lifecycle.

---

## 2. Target Users

### 2.1 Primary User
**Amateur cricket coach or team captain** running a local T20 league side.

| Attribute | Detail |
|---|---|
| Team size | 10–15 players per side |
| Match frequency | 1–3 matches per week |
| Analytical background | None |
| Current tools | WhatsApp groups, CricHeroes (scorecard only) |
| Decision-making process | Gut feeling and experience |
| Biggest frustration | "I look at the scorecard and I still don't know what to tell them." |

### 2.2 Secondary Users
- **Amateur players** who receive individual feedback cards
- **Tournament organisers** who want team analytics across rounds

---

## 3. Feature Inventory (v2.0 — All Implemented)

### P0 — Core Analysis (Post-Match)

#### F1 — Smart Scorecard Input ✅
- Paste raw text (CricHeroes-style or plain text)
- Click "Load Sample" for instant demo data
- OCR photo scanning via Tesseract.js (no API cost, runs in-browser)
- Format: T20 / ODI; Phase focus: Full / Powerplay / Middle / Death

#### F2 — Player Intelligence Cards ✅
Per-player card containing:
- **Tag:** Anchor / Aggressor / Liability / Improving
- **Intent Score:** 1–10 metric
- **Key Stat:** Primary batting/bowling number
- **What Worked / What Failed:** Specific, number-backed
- **Next Match Instruction + Practice Drill**

#### F3 — Team Pattern Report ✅
- Match Turning Point (exact over cited)
- Strongest Partnership
- Bowling Inefficiency
- Over-by-Over Run Rate Chart (Recharts) with red turning point marker
- Momentum Heatmap visualisation

#### F4 — Coach Decision Brief ✅
- Selection Call (who earned it / who is on notice)
- Batting Order Adjustment
- Bowling Rotation
- Toss Advisor (based on historical win/loss data)
- Tactical Mismatch Warnings (role vs position conflicts)
- Tactical Focus for next match

#### F5 — WhatsApp Integration ✅
- AI generates personalised 2-sentence feedback per player
- Opens WhatsApp Web pre-filled; player cannot see others' messages

#### F6 — Season Form Engine ✅
- Consistency scores aggregated across all stored matches
- Clutch Factor: flags Big Match Players vs Frontrunners
- Trend Indicators: up / flat / down across last 2 matches

---

### P0 — Real-Time / Live Match Tools

#### F7 — Live Match Assistant ✅
The core dugout tool. Coach logs every ball (0/1/2/3/4/6/W) in real time. At the end of each over, AI returns:
- Tactical recommendation (2–3 specific actions)
- Pressure rating (Low / Medium / High / Critical)
- Projected final score
- Stat-backed reasoning (e.g., "their #4 averages 12 vs spin — bring spinner now")

#### F8 — Target Score Advisor ✅
Input: current score, overs completed, wickets in hand, ground size.  
Output: par score range, aggressive target threshold, concrete tactical advice.

#### F9 — Best XI Selector ✅
Input: squad of 13–15 players with roles + opponent context.  
Output: ranked playing XI with batting order, justification per selection, and specific reason why dropped players were excluded.

#### F10 — Player Comparison Card ✅
Head-to-head metrics for two players competing for one spot. Numbers only. No opinion. AI verdict at the bottom.

---

### P0 — Growth & Analytics

#### F11 — Instagram Match Card Generator ✅
- Canvas-based 1080×1080 PNG (no external API)
- Dark premium design with amber branding
- Includes: team names, result badge, turning point quote, top performer, tactical focus, `@coachlens` growth loop
- One-click download

#### F12 — Formal Report Generator ✅
- Full AI-generated coaching report in a modal
- Printable / PDF-compatible format
- Used for sharing with team management / tournament organisers

#### F13 — Coach Tone Selector ✅
- Toggle between **Direct** / **Encouraging** / **Brutal Honest**
- AI rewrites all player cards, team report, and coach brief live on screen
- Demonstrates dynamic prompt engineering to judges

---

### P1 — Deep Analytics

#### F14 — Shot Weakness Mapper ✅
- Scans match history for dismissal patterns per batter
- Uses regex matching against 15 dismissal types (aerial, yorker, spin, etc.)
- Produces opponent brief: "Gets out: caught boundary (3×), bowled through gate (2×)"
- Severity flags: High / Medium / Low

#### F15 — Choke Detector ✅
- Classifies matches as League or Knockout (auto-detected + manual toggle)
- Compares player impact scores across both categories
- Flags players with significant big-match dropoffs
- Coach note: "Do not bat X at #3 in finals — averages 38 in league, 9 in knockouts"

#### F16 — Squad Rotation Planner ✅
- Input: squad (13+) with fitness status + match schedule (5+ games)
- AI generates per-match playing XI with rotation rationale
- Workload summary: how many games each player plays vs rests
- Prevents pace bowler burnout across tournament

#### F17 — Scorecard Photo Scanner ✅
- Upload or take a photo of a handwritten scorebook
- Tesseract.js OCR runs entirely in-browser (zero API cost, zero data upload)
- Extracts text with progress bar
- Removes typing friction for non-tech coaches using paper scorebooks

---

## 4. User Journeys

### Journey 1 — Post-Match (Coach at Home)
```
MATCH ENDS → Open CoachLens → Paste scorecard → Analyze (8–15 sec)
→ Review Player Cards → Switch to "Brutal Honest" tone → Reanalyze
→ View Team Report + Run Rate Chart (see exactly where we lost)
→ Read Coach Brief → Download Instagram Card → Post to team WhatsApp
```

### Journey 2 — Live (Coach in Dugout)
```
MATCH STARTS → Open Coach Tools → Live Match Assistant
→ Log balls over-by-over → Get AI tactic after Over 6
→ "Bring spinner. Their #4 is 0/3 vs spin. 2 overs quota left."
→ Execute → Log next over → Get updated recommendation
```

### Journey 3 — Pre-Match (Tournament Week)
```
MONDAY → Open Squad Rotation Planner → Input 5 matches + 15 players
→ AI generates rotation plan → Rest pace bowlers for Match 3 (spin-weak opponent)
→ Check Shot Weakness Mapper for key opposition players
→ Open Best XI Selector → Enter opponent context → Get ranked XI
```

---

## 5. Out of Scope (v2.0)

| Excluded Feature | Reason |
|---|---|
| Live scoring / ball-by-ball official tracking | Separate product; requires hardware integration |
| Video analysis | Infrastructure cost |
| Fantasy cricket integration | Different user intent |
| Public player profiles | Privacy risk |
| Pitch/weather condition analysis | Data not in scorecard input |

---

## 6. Success Metrics

| Metric | Target (Month 1) |
|---|---|
| Analyses completed | 500+ |
| Coach retention (2nd analysis) | 40%+ |
| Time-to-insight after paste | < 30 seconds |
| Instagram cards downloaded | 100+ |
| Live Match sessions | 50+ |
| Coach satisfaction score (survey) | 8/10+ |

---

## 7. Monetisation

### 7.1 Model: Freemium

**Free Tier (Forever):**
- Single match analysis
- Basic player cards
- Team pattern report
- All Coach Tools (read-only)

**Paid Tier — Rs. 99/team/month:**
- Multi-match trend tracking
- Player shareable cards
- Full Coach Decision Brief history
- PDF + Instagram card export
- Live Match Assistant (unlimited sessions)
- Priority API access

### 7.2 Market Sizing

| Parameter | Figure |
|---|---|
| Registered amateur cricket teams in India | 3,00,000+ |
| Target conversion rate (Year 1) | 1% |
| Paying teams | 3,000 |
| MRR at Rs. 99/team | Rs. 2,97,000 |
| ARR | Rs. 35,64,000 |

---

## 8. Technical Constraints & Risks

| Risk | Mitigation |
|---|---|
| Groq API rate limit hit during demo | Pre-cached fallback AI response; model set to `llama-3.1-8b-instant` for max TPD |
| Scorecard format inconsistency | Liberal input parsing + Tesseract OCR fallback + Load Sample |
| Low data quality (5-player entries) | "Insufficient data" flags rather than bad guesses |
| CricHeroes API not public | Phase 2 feature; paste flow covers Phase 1 entirely |
| Coach not tech-savvy | WhatsApp-friendly share; one-button flow; OCR removes typing entirely |
| localStorage limits | Sufficient for MVP; Supabase migration planned for Phase 2 |
| Large JS bundle | Tesseract.js dynamically imported; Recharts in separate chunk |
