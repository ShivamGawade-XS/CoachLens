# CoachLens 🏏

> **Paste your scorecard. Get a full coaching brief in 30 seconds.**

CoachLens is an AI-powered post-match analysis tool for amateur cricket coaches. It transforms raw scorecard data into actionable player feedback, team pattern reports, and pre-match decision briefs — the intelligence layer that currently does not exist at the grassroots level.

Built for **GBOA Code Premier League 2026 — Round 2** by Team AITD, Goa.

---

## The Problem

After every local cricket match, the coach gathers the team and says — *"we need to bat better, bowl tighter, field harder."* Every single time. No specifics. No plan. Players go home, nothing changes, and they lose again next week.

Amateur cricket coaches have no analytical tools. CricHeroes gives them a scoreboard — raw numbers with zero context. There is no tool that tells a coach:

- Here is **exactly why you lost** (over-by-over)
- Here is **who needs to change what** (player-level, number-backed)
- Here is **what to tell each player** at tomorrow's practice
- Here is your **tactical decision** for next week

This gap exists for 3 lakh+ amateur cricket teams across India. IPL franchises pay lakhs for this intelligence. Amateur coaches get nothing. **CoachLens fixes that.**

---

## Features

| Feature | Description |
|---|---|
| 🎯 **Smart Scorecard Input** | Paste raw text scorecard or enter stats manually. Supports T20 and ODI formats. |
| 👤 **Player Intelligence Cards** | Colour-coded per-player cards: Performance Tag, what worked, what failed, one drill. |
| 📊 **Team Pattern Report** | Match turning point, strongest partnership, bowling inefficiency, scoring pattern vs par. |
| 📋 **Coach Decision Brief** | Selection calls, batting order changes, bowling rotation, one tactical focus for next game. |
| 🔗 **Shareable Player Cards** | Individual feedback cards shareable via link — private, not public. |
| 🗂️ **Match History Dashboard** | Past analyses stored locally, accessible anytime. |

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- A [Groq API key](https://console.groq.com) (free tier is sufficient)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-team/coachlens.git
cd coachlens

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the project root:

```env
REACT_APP_GROQ_API_KEY=your_groq_api_key_here
```

> ⚠️ Never commit your `.env` file. It is already in `.gitignore`.

### Run Locally

```bash
npm start
```

Opens at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React 18 + Tailwind CSS |
| AI Engine | Groq API (Llama 3.3 70B) |
| Data Storage | localStorage (Phase 1) / Supabase (Phase 2) |
| Hosting | Vercel |
| Card Export | html2canvas + jsPDF |

**Total infrastructure cost: Rs. 0**

---

## Project Structure

```
coachlens/
├── public/
├── src/
│   ├── components/
│   │   ├── ScoreboardInput/      # Paste + manual entry forms
│   │   ├── PlayerCard/           # Individual player analysis cards
│   │   ├── TeamReport/           # Team-level pattern summary
│   │   ├── CoachBrief/           # Pre-match decision document
│   │   └── Dashboard/            # Match history view
│   │
│   ├── services/
│   │   ├── groqService.js        # Groq API call + error handling
│   │   ├── promptBuilder.js      # System prompt assembly
│   │   └── storageService.js     # localStorage helpers
│   │
│   ├── utils/
│   │   ├── parseScorecard.js     # Input preprocessing
│   │   └── fallbackData.js       # Pre-cached demo responses
│   │
│   └── App.jsx
│
├── .env.example
├── .env                          # ← not committed
├── .gitignore
├── package.json
└── README.md
```

---

## How It Works

### 1. Scorecard Input
Paste a CricHeroes scorecard (or any plain text format) into the input field. Select match format (T20/ODI) and phase focus (Powerplay / Middle / Death).

### 2. AI Analysis
CoachLens sends the scorecard to the **Groq API (Llama 3.3 70B)** with a carefully engineered system prompt that forces structured JSON output. Analysis completes in under 10 seconds.

### 3. Structured Output
The AI returns a JSON object parsed into:
- Per-player performance tags and feedback
- Team-level turning point and pattern analysis
- Three concrete pre-match coaching decisions

### 4. Shareable Cards
Each player card can be exported as an image (via `html2canvas`) and shared via WhatsApp link — individually, not as a public broadcast.

---

## AI Prompt Design

The core AI prompt enforces strict rules to ensure output quality:

```
Rules:
✓ Every insight must reference a specific number from the scorecard
✓ No vague language ("bat better", "improve consistency")
✓ Direct coaching language — not motivational
✓ Flag insufficient data explicitly rather than guessing
✓ No assumptions about pitch, weather, or opposition
```

Temperature is set to `0.3` to maximise factual consistency and minimise hallucination.

---

## Demo

### Pre-seeded Teams
The app ships with 3 pre-seeded matches for demo purposes:
- **Panaji Panthers vs Margao Strikers** (Won · T20)
- **Margao Strikers vs Vasco Warriors** (Lost · T20)
- **Vasco Warriors vs Ponda Eagles** (Won · T20)

### API Fallback
If the Groq API is unavailable during a demo, CoachLens automatically uses a pre-cached analysis response. Output is identical to a live API response.

---

## Deployment (Vercel)

1. Push to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add `REACT_APP_GROQ_API_KEY` in Vercel environment variables
4. Deploy

Vercel auto-deploys on every push to `main`.

---

## Why Not CricHeroes?

> *"CricHeroes is a scoreboard. It records what happened. CoachLens tells you what it means and what to do next."*

CricHeroes and CoachLens are complementary. Phase 2 of CoachLens pulls directly from CricHeroes via API — so coaches do not have to enter data twice. CoachLens is not a competitor; it is the intelligence layer on top.

---

## Roadmap

### Phase 1 — MVP (Current)
- [x] Smart scorecard input (paste + manual)
- [x] Player Intelligence Cards
- [x] Team Pattern Report
- [x] Coach Decision Brief
- [x] Pre-seeded demo data + API fallback

### Phase 2 — Month 1–3
- [ ] CricHeroes API integration (auto scorecard import)
- [ ] Mobile-responsive PWA
- [ ] Player shareable cards with unique links
- [ ] Supabase persistence (multi-device match history)
- [ ] Multi-sport support (football, kabaddi)

### Phase 3 — Month 4–6
- [ ] Player performance profiles across full season
- [ ] Opposition analysis (when both teams use CoachLens)
- [ ] Coach-to-player messaging within app
- [ ] PDF export of full coach brief history

---

## Monetisation

| Tier | Price | Features |
|---|---|---|
| **Free** | Rs. 0 | Single match analysis, basic player cards, team report |
| **Team** | Rs. 99/month | Multi-match trends, shareable cards, full brief history, PDF export |

**Market:** 3 lakh+ registered amateur cricket teams in India.  
**At 1% conversion → Rs. 2.97L MRR.**

---

## Team

| Member | Role | Skills |
|---|---|---|
| **Shivam Mahesh Gawade** | AI Integration + Prompt Engineering | Full-stack, Claude/Groq API, cybersecurity |
| Teammate 2 | Frontend — UI, Player Cards, Report Layout | React, Tailwind CSS, component design |
| Teammate 3 | Research, Documentation, Demo Video, User Validation | Content, communication, user research |

**Institution:** Agnel Institute of Technology and Design (AITD), North Goa  
**Affiliated:** Goa University

---

## Contributing

This is a hackathon project. For the purposes of GCPL 2026 Round 2, contributions are limited to team members.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*CoachLens — Amateur cricket is India's most played and least served sport. We're changing what it means to coach at the grassroots level.*
