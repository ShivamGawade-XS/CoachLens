# Tech Stack Document
# CoachLens — Technical Architecture & Implementation Guide

**Version:** 2.0  
**Authors:** Shivam Mahesh Gawade, Ashwith Ashok Shetty, Rahul Ravi Rathod  

---

## 1. Architecture Overview

CoachLens is a **client-heavy, AI-first web application**. All intelligence runs through the Groq API — no custom ML model, no training pipeline. The architecture is optimised for zero cost, zero backend complexity, and maximum AI quality through prompt engineering.

```
┌────────────────────────────────────────────────────────────────┐
│                        COACH (Browser)                          │
│                                                                 │
│  ┌──────────────┐   ┌───────────────┐   ┌──────────────────┐  │
│  │  Scorecard   │──▶│  React UI     │──▶│  Analysis Output │  │
│  │  Input / OCR │   │  Dashboard    │   │  + Live Tools    │  │
│  └──────────────┘   └──────┬────────┘   └──────────────────┘  │
│                             │                                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Client-Side Logic: seasonScoring · coachingMetrics   │    │
│  │  mismatchLogic · RunRateParser · Tesseract OCR         │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────┬──────────────────────────────────┘
                              │ HTTPS / fetch
                              ▼
               ┌──────────────────────────┐
               │       Groq API            │
               │  llama-3.1-8b-instant    │
               │  JSON mode enabled        │
               │  3 parallel prompt calls  │
               └────────────┬─────────────┘
                            │
               ┌────────────▼─────────────┐
               │       localStorage        │
               │  Match history + Settings │
               │  + User teams + API key   │
               └──────────────────────────┘
```

---

## 2. Full Stack Breakdown

### 2.1 Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.x | Component-based UI, reactive state |
| **Tailwind CSS** | 3.x | Utility-first styling, dark mode, design tokens |
| **Vite** | 5.x | Build tool — ultra-fast HMR, ESM output |
| **React Router** | 7.x | Client-side routing, protected routes |
| **Recharts** | 3.x | Over-by-over run rate chart, momentum visualisation |
| **html2canvas** | 1.4.x | PDF export (captures DOM to image) |
| **jsPDF** | 2.x | Generates PDF from html2canvas output |
| **HTML Canvas API** | Native | Instagram Match Card (1080×1080 PNG, no external dep) |
| **Tesseract.js** | 5.x | Client-side OCR for handwritten scorecard photos |
| **Lucide React** | 0.300.x | Icon system |

### 2.2 AI Engine

| Technology | Purpose |
|---|---|
| Groq API | Inference provider — sub-3-second responses |
| **llama-3.3-70b-versatile** | Model — larger, deep reasoning capabilities (used for primary scorecard analysis) |
| **llama-3.1-8b-instant** | Model — fast, instruction-following, JSON reliable (used for lightweight tool features) |

**Why Groq over OpenAI?**
- Free tier with daily token limits sufficient for hackathon demo
- 3–5× faster than GPT-4o at equivalent tasks
- Token costs remain zero for prototype phase

**Model Selection Strategy:**
- **llama-3.3-70b-versatile**: Used for primary post-match scorecard analysis (`api/analyze.js`) where deep reasoning and detailed tactical insights are required.
- **llama-3.1-8b-instant**: Used for lightweight live match tool features (`groqService.js`) to provide rapid responses and fit comfortably within the free tier token budget limits.

**API Configuration (current):**
```javascript
const response = await fetch("/api/groq", {
  method: "POST",
  headers: getHeaders(),
  body: JSON.stringify({
    model: GROQ_MODEL,
    messages: [
      { role: "user", content: prompt }
    ],
    temperature: GROQ_TEMPERATURE.TACTICAL,
    max_tokens: 1500,
    response_format: { type: "json_object" }
  })
});
```

**Three Parallel Prompt Calls:**
Analysis is split into three separate API calls (Players, Team Summary, Coach Brief) to keep each prompt focused and avoid token overflow:
```
Call 1 → PLAYER_PROMPT → { players: [...] }
Call 2 → TEAM_PROMPT   → { team_summary: {...} }
Call 3 → BRIEF_PROMPT  → { coach_decisions: {...} }
```

**Tone System (Prompt Engineering):**
All three prompts accept a `{tone}` variable:
```
Tone: Brutal Honest
CRITICAL: Do not hold back. Criticize poor numbers fiercely, use harsh truths.
```
Changing tone triggers a real-time reanalysis in the UI — same match, different language register.

### 2.3 OCR Engine

| Technology | Purpose | Cost |
|---|---|---|
| **Tesseract.js v5** | In-browser OCR for scorecard photos | Rs. 0 — runs entirely client-side |

```javascript
// Dynamically imported — only loads when coach uses scanner
const Tesseract = await import('tesseract.js');
const result = await Tesseract.recognize(imageFile, 'eng', {
  logger: (m) => { if (m.status === 'recognizing text') setProgress(m.progress * 100); }
});
```

No image is uploaded to any server. OCR runs entirely in the browser via WebAssembly.

### 2.4 Data Visualisation

| Component | Library | Description |
|---|---|---|
| **RunRateChart** | Recharts | Over-by-over CRR vs RRR line chart with red turning point `ReferenceLine` |
| **MomentumChart** | Custom | Heatmap-style momentum visualisation from raw over data |
| **InstagramCard** | Canvas API | 1080×1080 match summary card drawn to `<canvas>`, exported as PNG |

**RunRateChart — Data Source Priority:**
1. **Real data**: Parses `"Over N: X runs"` lines from `rawScorecard`
2. **Fallback**: Deterministic simulated data (no `Math.random()` — avoids chart flicker on re-render)

### 2.5 Data Storage

| Storage Layer | Technology | Scope |
|---|---|---|
| **Session state** | React `useState` | Current analysis, UI mode, active tab |
| **Match history** | `localStorage` (key: `coachlens_matches`) | All past analyses |
| **API key** | `localStorage` (key: `GROQ_API_KEY`) | User-provided in Settings |
| **Teams** | `localStorage` (key: `coachlens_teams_<userId>`) | Team rosters |
| **Auth** | Supabase Auth | User sessions, JWT |
| **Phase 2** | Supabase PostgreSQL | Multi-device sync |

**localStorage Schema:**
```javascript
{
  "coachlens_matches": [
    {
      "id": "uuid",
      "date": "ISO string",
      "format": "T20",
      "phase": "Full Match",
      "rawScorecard": "...",
      "teamName": "Panaji Panthers",
      "opponent": "Margao Strikers",
      "result": "Won",
      "processingTime": 8432,
      "analysis": {
        "players": [ { name, role, tag, key_stat, match_impact, what_worked, what_failed, next_match_instruction, practice_drill } ],
        "team_summary": { what_won_lost_match, strongest_partnership, bowling_inefficiency, pattern },
        "coach_decisions": { batting_order_change, bowling_rotation, player_on_notice, tactical_focus_next_game }
      }
    }
  ]
}
```

### 2.6 Auth

| Service | Purpose |
|---|---|
| **Supabase Auth** | Email/password, session management, JWT |
| **React Context** | `AuthContext` provides `user`, `signIn`, `signUp`, `signOut` |
| **ProtectedRoute** | HOC wrapping all `/dashboard`, `/analyze`, `/tools` routes |

### 2.7 Hosting & Deployment

| Service | Purpose | Cost |
|---|---|---|
| **Vercel** | Frontend hosting, auto-deploy | Free |
| **GitHub** | Version control, CI/CD trigger | Free |

```
git push origin main
        │
        ▼
Vercel detects Vite config
        │
        ▼
npm run build → dist/
        │
        ▼
Deployed to *.vercel.app (CDN edge)
```

**Environment Variables:**
```
VITE_GROQ_API_KEY=gsk_...   # Optional — users can also set in-app via Settings
```

---

## 3. Total Infrastructure Cost

| Layer | Tool | Monthly Cost |
|---|---|---|
| Frontend | React + Tailwind CSS + Vite | Rs. 0 |
| AI Engine | Groq API (Free tier) | Rs. 0 |
| OCR | Tesseract.js (client-side) | Rs. 0 |
| Charts | Recharts | Rs. 0 |
| Storage | localStorage + Supabase Free | Rs. 0 |
| Auth | Supabase Free | Rs. 0 |
| Hosting | Vercel Free | Rs. 0 |
| Canvas Export | Native browser API | Rs. 0 |
| **TOTAL** | | **Rs. 0** |

---

## 4. AI Prompt Architecture

### 4.1 Three-Prompt System

```
PLAYER_PROMPT   → Player cards (name, tag, metrics, feedback per player)
TEAM_PROMPT     → Team summary (turning point, partnership, bowling, pattern)
BRIEF_PROMPT    → Coach decisions (order, rotation, notice, focus)
```

Each prompt is self-contained and returns a clean JSON object. The three results are merged into a single `analysis` object in `groqService.js`.

### 4.2 Tone Injection
All three prompts accept `{tone}` as a template variable:
- `Direct` — objective, analytical
- `Encouraging` — constructive, positive framing
- `Brutal Honest` — unfiltered, harsh truths about poor performances

### 4.3 Additional AI Functions

```javascript
groqService.getOverRecommendation(matchState)  // Live match assistant
groqService.selectBestXI(squad, context)       // Best XI selector
groqService.generateWhatsAppMessages(players)  // Personalized player feedback
groqService.generateFormalReport(match)        // Full coaching report
groqService.getTurningPoint(overData)          // Turning point over detection
```

### 4.4 JSON Parsing (Resilient)
```javascript
try {
  return JSON.parse(rawResponse);
} catch (e) {
  return JSON.parse(rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
}
```

---

## 5. Client-Side Intelligence Layer

Not everything requires an API call. CoachLens employs a pure client-side logic layer for instant secondary intelligence.

### 5.1 `coachingMetrics.js` — Intent Score & Pressure Index
- **Intent Score (1–10):** Regex scans AI text for passive keywords (`dot balls`, `slow`, `blocking`) vs active keywords (`boundary`, `attack`, `aggressive`). Computed instantly with no API call.
- **Pressure Index:** Tags players as `Clutch 🧊` or `Pressure Risk ⚡` based on keyword patterns in their `what_failed` and `what_worked` fields.

### 5.2 `mismatchLogic.js` — Tactical Mismatch Detection
Heuristic checks on combined AI output:
- Anchor batting at #1 or #2 → "Warning: Anchor in powerplay slot"
- Liability bowler in death overs → "Warning: Liability bowling in death overs"
- Wicketkeeper tagged as Aggressor at #8 → "Role/position mismatch"

### 5.3 `seasonScoring.js` — Season Form Engine
- Aggregates `match_impact` scores across all `localStorage` matches
- **Clutch Factor:** Compares average impact in Won vs Lost matches
- **Trend:** Compares last 2 appearances vs overall average
- Result: sorted leaderboard with trend arrows (↑ / → / ↓)

### 5.4 `ShotWeaknessMapper` — Dismissal Pattern Analysis
- Regex matching against 15 dismissal pattern templates
- No API call needed — runs entirely on stored `what_failed` text
- Generates opponent brief: "Gets out: caught boundary (3×)"

### 5.5 `RunRateChart` — Over Data Parser
- Parses `"Over N: X runs, Y wickets"` lines from raw scorecard text
- Computes cumulative run rate and required rate per over
- No API call — pure client-side calculation

---

## 6. Component Architecture (Current)

```
src/
├── components/
│   ├── BestXISelector/          # Squad input → AI ranked XI
│   ├── ChatAssistant/           # Floating AI coaching chat
│   ├── ChokeDetector/           # League vs knockout stat comparison
│   ├── CoachBrief/              # Pre-match decisions panel
│   ├── Dashboard/               # Match history + season form table
│   ├── FormalReportModal/       # Printable full coaching report
│   ├── InstagramCard/           # Canvas 1080×1080 PNG generator
│   ├── Layout/                  # AppLayout, PublicLayout, sidebar nav
│   ├── LiveMatchAssistant/      # Ball-by-ball dugout tool
│   ├── MomentumChart/           # Over momentum heatmap
│   ├── PlayerCard/              # Per-player analysis card
│   ├── PlayerComparison/        # Head-to-head selection tool
│   ├── ProtectedRoute/          # Auth guard HOC
│   ├── RunRateChart/            # Over-by-over CRR/RRR line chart
│   ├── ScoreboardInput/         # Paste + Load Sample + Import URL
│   ├── ScorecardScanner/        # Tesseract.js OCR photo upload
│   ├── ShotWeaknessMapper/      # Dismissal pattern analysis
│   ├── SquadRotationPlanner/    # Tournament workload AI planner
│   ├── TargetScoreAdvisor/      # Real-time par score calculator
│   ├── TeamReport/              # Team pattern summary
│   └── WhatsAppModal/           # Player message generator
│
├── pages/
│   ├── AnalysisFlow.jsx         # Scorecard input → loading → results
│   ├── AppPages.jsx             # Teams list + Settings components
│   ├── CoachTools.jsx           # 8-tool sidebar hub
│   ├── LandingPage.jsx          # Marketing home
│   ├── LoginPage.jsx            # Auth
│   ├── MatchResults.jsx         # Tabs: Players / Team Report / Coach Brief
│   ├── PlayerProfile.jsx        # Cross-match player history
│   ├── SignupPage.jsx           # Auth
│   └── TeamProfile.jsx          # Team management + match history
│
├── services/
│   ├── groqService.js           # All Groq API calls + tone + progress
│   └── storageService.js        # localStorage CRUD + demo seeding
│
├── contexts/
│   └── AuthContext.jsx          # Supabase auth provider
│
└── utils/
    ├── coachingMetrics.js       # Intent Score, Pressure Index
    ├── fallbackData.js          # Pre-cached demo responses
    ├── mismatchLogic.js         # Role/position mismatch detection
    ├── parseScorecard.js        # Input validation + preprocessing
    └── seasonScoring.js         # Season form + clutch factor engine
```

---

## 7. Build & Performance

### Bundle Chunks (Production)
```
vendor-react.js      ~180 kB gz    React + React DOM + React Router
vendor-charts.js     ~378 kB gz    Recharts + D3 dependencies
vendor-utils.js      ~588 kB gz    html2canvas + jsPDF + Tesseract loader
index.js             ~525 kB gz    App code
```

### Optimisations Applied
- **Tesseract.js**: Dynamically imported only when coach opens the Scanner tool
- **Recharts**: Separated into `vendor-charts` chunk via Vite
- **html2canvas**: Part of `vendor-utils` — only downloaded once, cached by browser

---

## 8. Security

| Risk | Mitigation |
|---|---|
| API key exposure | Never hardcoded; stored in `localStorage` (user-set) or `VITE_GROQ_API_KEY` (Vercel env, not in client bundle at runtime if using SSR — acceptable for SPA MVP) |
| Prompt injection via scorecard | Input truncated to 8,000 chars max before prompt assembly |
| Stored match data privacy | `localStorage` is device-local; no server transmission in Phase 1 |
| Rate limit abuse | Groq free tier naturally rate-limits; UI disables Analyze button during processing |

---

## 9. Phase 2 Technical Additions

| Feature | Technology | Complexity |
|---|---|---|
| CricHeroes auto-import | CricHeroes API or Playwright scraper | Medium |
| Multi-device match history | Supabase PostgreSQL + RLS | Low |
| PWA (offline capable) | Vite PWA plugin + Service Workers | Low |
| Player shareable links | Supabase short URLs + nanoid | Low |
| Real ball-by-ball tracking | WebSocket or polling + Supabase Realtime | High |
| manualChunks optimisation | Vite rollupOptions.output.manualChunks | Low |
