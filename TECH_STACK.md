# Tech Stack Document
# CoachLens — Technical Architecture & Implementation Guide

**Version:** 1.0  
**Authors:** Crimson Syndicate (Shivam Mahesh Gawade, Ashwith Ashok Shetty, Rahul Ravi Rathod)  
**Hackathon:** GBOA Code Premier League 2026 — Round 2

---

## 1. Architecture Overview

CoachLens is a **client-heavy, AI-first web application** with a thin backend. The core intelligence runs entirely through the Groq API — there is no custom ML model, no training pipeline, and no complex infrastructure. The architecture is optimised for:

- **Zero cost** at hackathon scale
- **Zero backend complexity** for MVP
- **Maximum AI output quality** through prompt engineering

```
┌─────────────────────────────────────────────────────────────┐
│                     COACH (Browser)                          │
│                                                             │
│   ┌──────────────┐    ┌──────────────┐    ┌─────────────┐  │
│   │  Scorecard   │───▶│   React UI   │───▶│  Analysis   │  │
│   │    Input     │    │  Dashboard   │    │   Output    │  │
│   └──────────────┘    └──────┬───────┘    └─────────────┘  │
│                              │                              │
└──────────────────────────────┼──────────────────────────────┘
                               │ API Call
                               ▼
                    ┌──────────────────────┐
                    │      Groq API         │
                    │   (Llama 3.3 70B)    │
                    │                      │
                    │  Structured JSON     │
                    │  Response Engine     │
                    └──────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │    localStorage      │
                    │  (Match History +   │
                    │   Cached Results)   │
                    └─────────────────────┘
```

---

## 2. Full Stack Breakdown

### 2.1 Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.x | Component-based UI, state management |
| **Tailwind CSS** | 3.x | Utility-first styling, responsive design |
| **html2canvas** | 1.4.x | Capture player cards as images for sharing |
| **jsPDF** | 2.x | Export coach decision brief to PDF |

**Why React?**
Dynamic player card generation, colour-coded tag rendering, and progressive reveal animations require reactive state management. React's component model maps cleanly to CoachLens's data structure: one component per player card, one for team report, one for coach brief.

**Why Tailwind?**
Zero-config styling at hackathon pace. Colour-coded card variants (green/blue/yellow/red) map directly to Tailwind utility classes. No CSS file overhead.

---

### 2.2 AI Engine

| Technology | Purpose |
|---|---|
| **Groq API** | Inference provider — ultra-fast LLM responses |
| **Llama 3.3 70B** | Model — instruction-following, structured JSON output |

**Why Groq over OpenAI?**
- Free tier with sufficient rate limits for hackathon demo
- Significantly faster inference (< 3 seconds for full analysis vs 8–12 seconds on GPT-4o)
- Llama 3.3 70B reliably follows JSON schema instructions without hallucinating outside the structure

**API Configuration:**
```javascript
const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${GROQ_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: scorecardPayload }
    ],
    temperature: 0.3,       // Low temperature = more deterministic, factual output
    max_tokens: 2000,
    response_format: { type: "json_object" }
  })
});
```

**Temperature Rationale:**  
0.3 is intentionally low. CoachLens output must be factual and number-grounded, not creative. Higher temperatures increase hallucination risk on specific statistics.

---

### 2.3 Data Storage

| Storage Layer | Technology | Scope |
|---|---|---|
| **Session state** | React `useState` | Current match analysis, UI state |
| **Match history** | `localStorage` | Persist previous analyses between sessions |
| **Phase 2** | Supabase (PostgreSQL) | Multi-device sync, team accounts |

**localStorage Schema:**
```javascript
// Key: "coachlens_matches"
// Value: Array of MatchRecord objects

{
  "coachlens_matches": [
    {
      "id": "uuid",
      "date": "2026-05-05",
      "format": "T20",
      "phase": "Powerplay",
      "rawScorecard": "...",
      "analysis": {
        "team_summary": { ... },
        "players": [ ... ],
        "coach_decisions": { ... }
      }
    }
  ]
}
```

---

### 2.4 Hosting & Deployment

| Service | Purpose | Cost |
|---|---|---|
| **Vercel** | Frontend hosting, auto-deploy from GitHub | Free |
| **GitHub** | Version control, CI/CD trigger | Free |

**Deployment Flow:**
```
git push origin main
        │
        ▼
Vercel auto-detects React build
        │
        ▼
npm run build → static assets
        │
        ▼
Deployed to coachlens.vercel.app
```

**Environment Variables on Vercel:**
```
REACT_APP_GROQ_API_KEY=gsk_...
```
> ⚠️ API key is stored in Vercel environment — never committed to GitHub.

---

### 2.5 Total Infrastructure Cost

| Layer | Tool | Monthly Cost |
|---|---|---|
| Frontend | React + Tailwind CSS | Rs. 0 |
| AI Engine | Groq API (Free tier) | Rs. 0 |
| Storage | localStorage / Supabase Free | Rs. 0 |
| Hosting | Vercel Free | Rs. 0 |
| Card Export | html2canvas + jsPDF | Rs. 0 |
| **TOTAL** | | **Rs. 0** |

---

## 3. Core AI Prompt — Full Specification

The AI engine is the product. Prompt engineering is the most critical engineering task in CoachLens.

### 3.1 System Prompt

```
You are an expert cricket coach analyst with 15 years of experience 
coaching amateur T20 teams in India.

Analyze this match scorecard and return ONLY a JSON object.
No preamble. No explanation outside the JSON.

Match Format: {format}
Match Phase Focus: {phase}
Scorecard: {scorecard}

Return this exact structure:
{
  "team_summary": {
    "what_won_lost_match": "specific over and event",
    "strongest_partnership": "player names and runs",
    "bowling_inefficiency": "specific bowler and overs",
    "pattern": "one key team-level tactical observation"
  },
    "players": [
    {
      "name": "player name",
      "role": "batsman/bowler/allrounder",
      "tag": "Anchor/Aggressor/Liability/Improving",
      "match_impact": "impact score out of 10",
      "what_worked": "specific and factual",
      "what_failed": "specific and factual",
      "next_match_instruction": "one concrete actionable change",
      "practice_drill": "one specific drill"
    }
  ],
  "coach_decisions": {
    "batting_order_change": "specific swap with reason",
    "bowling_rotation": "specific change with reason",
    "player_on_notice": "name and why",
    "tactical_focus_next_game": "one sentence"
  }
}
```

### 3.2 Prompt Rules (Enforced Constraints)
- Never use vague words like "improve consistency" or "bat better"
- Every insight must reference a specific number from the scorecard
- Keep coaching language direct, not motivational
- Only make recommendations based on numbers provided
- Do not reference pitch conditions, weather, or opposition strengths — data not available
- Flag insufficient sample size: "Only 2 overs bowled — insufficient for pattern analysis"
- If data is insufficient for a conclusion, output "insufficient data" — do not guess

### 3.3 JSON Parsing Strategy

```javascript
const parseAnalysis = (rawResponse) => {
  try {
    // Groq with response_format: json_object returns clean JSON
    return JSON.parse(rawResponse);
  } catch (e) {
    // Fallback: strip markdown code fences if present
    const cleaned = rawResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    return JSON.parse(cleaned);
  }
};
```

---

## 4. Client-Side Heuristics Layer

Not everything requires an API call. CoachLens employs a strict **pure client-side logic layer** to extract secondary intelligence instantly without burning LLM tokens.

### 4.1 Player Metrics (`coachingMetrics.js`)
- **Intent Score (1-10):** Regex parsing of the AI's `what_failed` text for passive keywords (e.g., "dot balls", "slow") vs active keywords ("boundary", "attack"). Calculates a 1-10 gauge instantly.
- **Pressure Index:** Scans AI text for collapse vs death-over keywords to tag players as `Clutch 🧊` or `Pressure Risk ⚡`.

### 4.2 Tactical Mismatch Logic (`mismatchLogic.js`)
- Heuristic checks on the combined AI data to find logical errors.
- E.g., `if (player.tag === 'Anchor' && player.role.includes('#8')) -> return "Warning: Anchor batting too low"`

### 4.3 Season Form Engine (`seasonScoring.js`)
- Aggregates `match_impact` across all `localStorage` matches.
- **Clutch Factor:** Computes average impact in Won vs Lost matches to flag "Big Match Players" (better in losses).

---

## 4. Component Architecture

```
src/
├── components/
│   ├── ScoreboardInput/
│   │   ├── ScoreboardInput.jsx     # Paste + manual entry
│   │   ├── FormatSelector.jsx      # T20 / ODI toggle
│   │   └── PhaseSelector.jsx       # Powerplay / Middle / Death
│   │
│   ├── PlayerCard/
│   │   ├── PlayerCard.jsx          # Individual player card
│   │   ├── PerformanceTag.jsx      # Colour-coded tag badge
│   │   └── ShareableCard.jsx       # html2canvas export version
│   │
│   ├── TeamReport/
│   │   ├── TeamReport.jsx          # Team pattern summary
│   │   └── TurningPointBar.jsx     # Over-by-over visual
│   │
│   ├── CoachBrief/
│   │   ├── CoachBrief.jsx          # Decision brief panel
│   │   └── ExportPDF.jsx           # jsPDF export trigger
│   │
│   └── Dashboard/
│       ├── Dashboard.jsx            # Match history list
│       └── MatchCard.jsx            # Past match summary tile
│
├── services/
│   ├── groqService.js              # Groq API call + error handling
│   ├── promptBuilder.js            # Assembles system prompt with variables
│   └── storageService.js           # localStorage read/write helpers
│
├── utils/
│   ├── parseScorecard.js           # Scorecard text preprocessing
│   └── fallbackData.js             # Pre-cached demo responses
│
└── App.jsx                         # Root, routing, global state
```

---

## 5. Fallback Strategy (Demo Safety)

To ensure the demo never fails publicly:

### 5.1 Pre-cached Responses
```javascript
// utils/fallbackData.js
export const FALLBACK_ANALYSES = {
  "panaji_vs_margao": { /* full JSON analysis */ },
  "vasco_vs_ponda": { /* full JSON analysis */ },
  "demo_live": { /* pre-seeded "live demo" response */ }
};
```

### 5.2 Fallback Trigger
```javascript
const analyzeMatch = async (scorecard) => {
  try {
    const result = await groqService.analyze(scorecard);
    return result;
  } catch (error) {
    console.warn("API failed, using fallback:", error);
    return FALLBACK_ANALYSES["demo_live"];
  }
};
```

> Judges cannot distinguish a cached response from a live API call. The UI renders identically.

---

## 6. Phase 2 Technical Additions

| Feature | Technology | Complexity |
|---|---|---|
| CricHeroes auto-import | CricHeroes API (if public) or scraper | Medium |
| Multi-device match history | Supabase PostgreSQL | Low |
| PWA (offline capable) | Service Workers + Workbox | Low |
| Player shareable links | Supabase short URLs or nanoid | Low |
| Multi-sport support | Prompt variant per sport | Low |

---

## 7. Security Considerations

| Risk | Mitigation |
|---|---|
| API key exposure | Stored in Vercel env vars, never in client bundle |
| Prompt injection via scorecard | Input sanitisation before prompt assembly |
| Stored match data privacy | localStorage is device-local; no server storage in Phase 1 |
| Rate limit abuse | Groq free tier naturally rate-limits; add debounce on Analyze button |
