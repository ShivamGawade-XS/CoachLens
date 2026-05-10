# CoachLens 🏏

> **Paste your scorecard. Get a full coaching brief in 30 seconds.**

CoachLens is an AI-powered **dugout intelligence platform** for amateur cricket coaches. It transforms raw scorecard data into actionable player feedback, team pattern reports, pre-match decision briefs, and real-time in-match tactical advice — the intelligence layer that does not exist at the grassroots level.

Built for **GBOA Code Premier League 2026 — Round 2** by Crimson Syndicate (AITD, Goa).

---

## The Problem

After every local cricket match, the coach gathers the team and says — *"we need to bat better, bowl tighter, field harder."* Every single time. No specifics. No plan. Players go home, nothing changes, and they lose again next week.

Amateur cricket coaches have no analytical tools. CricHeroes gives them a scoreboard — raw numbers with zero context. CoachLens fixes that — and now goes further: it sits in the dugout **during** the match, not just after.

---

## Features

### 📊 Post-Match Analysis
| Feature | Description |
|---|---|
| 🎯 **Smart Scorecard Input** | Paste raw text or use OCR photo scanning via Tesseract.js |
| 👤 **Player Intelligence Cards** | Colour-coded cards: Tag, Intent Score, Pressure Index, one drill |
| 📊 **Team Pattern Report** | Match turning point, partnership, bowling inefficiency, run rate chart |
| 📋 **Coach Decision Brief** | Selection calls, batting order, bowling rotation, Toss Advisor |
| 📱 **WhatsApp Integration** | Generate personalised 2-sentence feedback per player |
| 📈 **Season Form Engine** | Consistency, Clutch Factor, and W/L trend across all matches |
| 📄 **Formal Report Generator** | Full AI-generated coaching report in a polished printable format |
| 📸 **Instagram Match Card** | Canvas-based 1080×1080 shareable graphic with branding, top performer, and match summary |

### 🔴 Live Match Tools (`/tools`)
| Tool | Description |
|---|---|
| 📻 **Live Match Assistant** | Ball-by-ball input → AI tactical recommendations after each over |
| 🎯 **Target Score Advisor** | Real-time par score calculator based on ground size, wickets, current RR |
| 🛡️ **Best XI Selector** | Paste a squad of 13–15, get an AI-ranked playing XI with full justifications |
| ⚔️ **Player Comparison** | Head-to-head metrics to settle selection debates with numbers |
| 🎯 **Shot Weakness Mapper** | Dismissal pattern analysis per batter — feeds an opponent brief |
| 🗓️ **Squad Rotation Planner** | Tournament workload management: who plays when across 5+ matches |
| 📉 **Choke Detector** | Flags players whose stats drop in knockouts vs league matches |
| 📸 **Scorecard Scanner** | OCR via Tesseract.js — take a photo of a handwritten scorebook |

### 🧠 AI Intelligence Layer
| Feature | Description |
|---|---|
| 🎭 **Coach Tone Selector** | Flip between Direct, Encouraging, and Brutal Honest — AI rewrites all cards live |
| 📈 **Run Rate Chart** | Over-by-over line chart with red turning point marker |
| 🌊 **Momentum Chart** | Visual team momentum heatmap from raw over data |

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm
- A [Groq API key](https://console.groq.com) (free tier is sufficient)

### Installation

```bash
git clone https://github.com/ShivamGawade-XS/CoachLens.git
cd CoachLens
npm install
```

### Environment Variables (Local Dev)

Create a `.env` file in the project root:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

> ⚠️ Never commit your `.env` file. It is already in `.gitignore`.  
> In production, set the key in **Settings → API Configuration** inside the app (stored in `localStorage`).

### Run Locally

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React 18 + Tailwind CSS |
| AI Engine | Groq API (`llama-3.1-8b-instant`) |
| Visualisation | Recharts (line charts, momentum maps) |
| OCR | Tesseract.js v5 (client-side, no API) |
| PDF Export | html2canvas + jsPDF |
| Social Cards | HTML Canvas API (1080×1080 PNG) |
| Auth | Supabase Auth |
| Data Storage | localStorage (MVP) / Supabase (Phase 2) |
| Hosting | Vercel |

**Total infrastructure cost: Rs. 0**

---

## Project Structure

```
CoachLens/
├── public/
├── src/
│   ├── components/
│   │   ├── BestXISelector/         # AI squad selection
│   │   ├── ChatAssistant/          # Floating AI coach chat
│   │   ├── ChokeDetector/          # Big-match pressure dropoff analysis
│   │   ├── CoachBrief/             # Pre-match decision document
│   │   ├── Dashboard/              # Match history + season form
│   │   ├── FormalReportModal/      # Full AI coaching report
│   │   ├── InstagramCard/          # Canvas 1080×1080 shareable graphic
│   │   ├── LiveMatchAssistant/     # Ball-by-ball dugout tool
│   │   ├── MomentumChart/          # Over-by-over momentum visualisation
│   │   ├── PlayerCard/             # Individual player analysis cards
│   │   ├── PlayerComparison/       # Head-to-head selection tool
│   │   ├── RunRateChart/           # Run rate line chart with turning point
│   │   ├── ScoreboardInput/        # Paste + load sample + import URL
│   │   ├── ScorecardScanner/       # Tesseract.js OCR photo scanner
│   │   ├── ShotWeaknessMapper/     # Dismissal pattern + opponent brief
│   │   ├── SquadRotationPlanner/   # Tournament workload AI planner
│   │   ├── TargetScoreAdvisor/     # Live par score calculator
│   │   ├── TeamReport/             # Team-level pattern summary
│   │   └── WhatsAppModal/          # Player message generator
│   │
│   ├── pages/
│   │   ├── AnalysisFlow.jsx        # Step-by-step match analysis flow
│   │   ├── AppPages.jsx            # Teams + Settings components
│   │   ├── CoachTools.jsx          # All 8 live tools hub
│   │   ├── LandingPage.jsx         # Marketing home page
│   │   ├── MatchResults.jsx        # Per-match analysis view
│   │   ├── PlayerProfile.jsx       # Cross-match player profile
│   │   └── TeamProfile.jsx         # Team management page
│   │
│   ├── services/
│   │   ├── groqService.js          # Groq API calls + tone + progress callbacks
│   │   └── storageService.js       # localStorage + demo seeding
│   │
│   └── utils/
│       ├── coachingMetrics.js      # Clutch factor, pressure index
│       ├── fallbackData.js         # Pre-cached demo responses
│       ├── mismatchLogic.js        # Role/position mismatch detection
│       ├── parseScorecard.js       # Input preprocessing
│       └── seasonScoring.js        # Cross-match season form engine
│
├── .env.example
├── .gitignore
├── package.json
├── PRD.md
├── DESIGN_DOC.md
├── TECH_STACK.md
└── README.md
```

---

## How It Works

### Post-Match Flow
1. **Paste** a CricHeroes scorecard (or click "Load Sample")
2. **Select** format (T20/ODI) and phase focus
3. **Analyze** — three parallel Groq API calls complete in ~8–15 seconds
4. View **Player Cards**, **Team Report** (with charts), and **Coach Brief**
5. **Reanalyze** with a different Tone (Direct / Encouraging / Brutal Honest) in one click

### Live Match Flow
1. Open **Coach Tools → Live Assistant**
2. Log balls (0/1/2/3/4/6/W) during each over
3. At over completion, AI returns tactical advice (field placement, bowler changes, pressure index)

---

## AI Prompt Design

All prompts enforce strict rules:

```
Rules:
✓ Every insight must reference a specific number from the scorecard
✓ No vague language ("bat better", "improve consistency")
✓ Direct coaching language — not motivational
✓ Flag insufficient data explicitly rather than guessing
✓ Tone parameter controls language style across all output fields
```

Temperature: `0.3` — maximises factual consistency, minimises hallucination.  
Model: `llama-3.1-8b-instant` — fastest inference, within free tier TPD limits.

---

## Demo

### Pre-seeded Matches
The app ships with 6 pre-seeded matches across 3 teams:
- **Panaji Panthers**, **Margao Strikers**, **Vasco Warriors**, **Ponda Eagles**

### API Key
Set via **Settings → API Configuration** in the app. No `.env` needed in production.

---

## Deployment (Vercel)

1. Push to GitHub (`git push origin main`)
2. Connect repo to [Vercel](https://vercel.com)
3. Optionally add `VITE_GROQ_API_KEY` in Vercel environment variables
4. Deploy — auto-deploys on every `main` push

---

## Roadmap

### Phase 1 — MVP ✅ (Completed)
- [x] Smart scorecard input (paste + OCR photo scanner)
- [x] Player Intelligence Cards with Intent & Pressure metrics
- [x] Team Pattern Report with Run Rate Chart + Turning Point Marker
- [x] Coach Decision Brief with Toss Advisor & Mismatch Detection
- [x] WhatsApp Coach Integration
- [x] Season Form & Clutch Factor Engine
- [x] Formal Report Generator
- [x] Instagram Match Card Generator
- [x] Coach Tone Selector (Direct / Encouraging / Brutal Honest)
- [x] Live Match Assistant (ball-by-ball dugout tool)
- [x] Target Score Advisor
- [x] Best XI Selector (AI-powered)
- [x] Player Comparison Card
- [x] Shot Weakness Mapper & Opponent Brief
- [x] Squad Rotation Planner (tournament workload)
- [x] Choke Detector (knockout vs league stats)

### Phase 2 — Month 1–3
- [ ] CricHeroes API integration (auto scorecard import)
- [ ] Mobile-responsive PWA
- [ ] Supabase persistence (multi-device match history)
- [ ] Multi-sport support (football, kabaddi)

### Phase 3 — Month 4–6
- [ ] Player performance profiles across full season
- [ ] Opposition analysis (when both teams use CoachLens)
- [ ] Coach-to-player messaging within app
- [ ] PDF export of full coach brief history

---

## Team: Crimson Syndicate

| Member | Role |
|---|---|
| **Shivam Mahesh Gawade** | AI Integration + Prompt Engineering |
| **Ashwith Ashok Shetty** | Frontend — UI, Player Cards, Report Layout |
| **Rahul Ravi Rathod** | Research, Documentation, Demo Video, User Validation |

**Institution:** Agnel Institute of Technology and Design (AITD), North Goa  
**Affiliated:** Goa University

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*CoachLens — Amateur cricket is India's most played and least served sport. We're changing what it means to coach at the grassroots level.*
