# CoachLens — Comprehensive Project Report

## 1. Executive Summary

**CoachLens** is an AI-powered dugout intelligence platform designed specifically for amateur cricket coaches and team captains. While professional IPL franchises spend millions on analytics and data science, amateur coaches operating at the grassroots level have historically lacked access to actionable intelligence. 

CoachLens bridges this gap by transforming raw scorecard data—collected via manual input, text paste, or direct optical character recognition (OCR) photo scans—into structured, actionable coaching intelligence. Operating in under 30 seconds via the Groq API (powered by `llama-3.1-8b-instant`), CoachLens provides comprehensive post-match reports, real-time live match advice, and sophisticated tournament management utilities, all within a completely free infrastructure footprint.

Built by Crimson Syndicate (led by Shivam Mahesh Gawade; members Shivam Mahesh Gawade, Ashwith Ashok Shetty, Rahul Ravi Rathod) as a modern digital solution for coaches, the application acts as the "intelligence layer" that sits atop traditional scorekeeping tools.

---

## 2. The Problem Statement

Amateur cricket is massive in India, with over 300,000 registered amateur teams. After a local match concludes, a standard coach's feedback is often generic: *"We need to bat better, bowl tighter, and field harder."* 

The core issue is a lack of analytical interpretation. Platforms like CricHeroes provide a scoreboard, but a scoreboard is just a record of what happened. It does not explain *why* it happened or *how* to fix it. 

CoachLens targets these specific unmet needs:
- Identifying exactly where a match was won or lost using over-by-over analysis.
- Generating number-backed, personalized feedback for each player rather than vague platitudes.
- Making concrete tactical decisions for the next match regarding selection, batting orders, and bowling rotation.
- Managing squad rotation in tournament settings to prevent player burnout.
- Delivering live, over-by-over tactical advice right in the dugout.

---

## 3. Core Capabilities & Feature Set

CoachLens is divided into three primary functional areas: Post-Match Analysis, Live Match Tools, and the AI Intelligence Layer.

### 3.1 Post-Match Analysis (The Core Loop)

* **Smart Scorecard Input:** Coaches can paste plain text scorecards or use the built-in Tesseract.js OCR scanner to take a photo of a physical, handwritten scorebook. The system parses the data locally without API calls.
* **Player Intelligence Cards:** Every player receives a detailed performance card including a Role Tag (e.g., Anchor, Aggressor, Liability), a calculated Intent Score, a Pressure Index, and specific actionable advice with a practice drill.
* **Team Pattern Report:** Evaluates the collective team effort. This includes identifying the exact over that acted as the Match Turning Point, the strongest partnership, bowling inefficiencies, and visual momentum maps.
* **Coach Decision Brief:** Pre-match intelligence for the next game. It recommends batting order adjustments, bowling rotations, and selection calls based on historical data. It also includes an AI Toss Advisor.
* **WhatsApp Integration:** The AI generates a personalized, 2-sentence feedback message for every player that coaches can send directly to WhatsApp with a single click.
* **Formal Report Generator:** Generates a professional, printable post-match report suitable for club management and tournament organizers.
* **Instagram Match Card:** An integrated Canvas API tool that generates beautiful, 1080x1080 social media graphics summarizing the match result and top performer for team marketing.

### 3.2 Live Match Tools (The Dugout Suite)

* **Live Match Assistant:** A real-time dugout tool where the coach logs basic ball outcomes (0, 1, 2, 4, 6, W). At the end of every over, the AI provides 2-3 specific tactical recommendations, a pressure rating, and a projected final score.
* **Target Score Advisor:** A real-time par score calculator that takes into account ground size, wickets in hand, and current run rate to advise if a team should consolidate or attack.
* **Best XI Selector:** Coaches input their 13-15 player squad and the AI selects the optimal starting XI, providing stat-backed justifications for who was picked and why others were dropped.
* **Player Comparison:** A head-to-head metric dashboard that resolves selection debates using pure numbers and an AI verdict.
* **Shot Weakness Mapper:** An automated tool that scans a player's history to identify dismissal patterns (e.g., getting caught on the boundary repeatedly) to generate an Opponent Brief.
* **Squad Rotation Planner:** Designed for tournament play. The coach inputs the match schedule, and the AI plans player rotations to manage workloads (especially for pace bowlers) across multiple matches.
* **Choke Detector:** Statistically isolates a player's performance in League matches versus Knockout matches to identify "Big Match Players" versus those who struggle under pressure.

### 3.3 AI Intelligence Layer

* **Coach Tone Selector:** A unique feature allowing the coach to toggle the AI's communication style between *Direct*, *Encouraging*, and *Brutal Honest*. This instantly rewrites all player cards and reports in real-time.
* **Client-Side Heuristics:** CoachLens intelligently offsets API costs by calculating secondary metrics entirely on the client side. This includes the Intent Score (regex parsing of passive vs. active keywords), the Pressure Index, and Tactical Mismatch Logic (e.g., warning a coach if an 'Anchor' is assigned to bat at #8).

---

## 4. Technical Architecture

CoachLens is designed as a **client-heavy, AI-first web application**. The backend is incredibly thin by design to ensure zero infrastructure costs at the MVP scale.

### 4.1 Tech Stack

* **Frontend:** React 18, Tailwind CSS, Vite, React Router.
* **AI Provider:** Groq API (using the `llama-3.1-8b-instant` model).
* **Data Visualization:** Recharts (for Over-by-Over Run Rate tracking and Momentum Charts).
* **OCR & Export:** Tesseract.js (Client-side OCR), html2canvas, jsPDF, and native HTML Canvas API.
* **Data Storage:** `localStorage` for Match History, Settings, and API Key management.
* **Authentication:** Supabase Auth (JWT session management).
* **Hosting:** Vercel edge deployment.

### 4.2 The AI Pipeline

The application relies on a sophisticated **Three-Prompt Parallel Architecture**. When a coach submits a scorecard, sending the entire prompt in a single call risks hitting token limits or confusing the LLM. CoachLens splits the analysis into three parallel, non-blocking requests:
1. `PLAYER_PROMPT` → Generates individual player metrics and feedback.
2. `TEAM_PROMPT` → Analyzes team-wide patterns and momentum shifts.
3. `BRIEF_PROMPT` → Formulates the coach's decision brief for the upcoming week.

All prompts enforce strict rules: they must cite specific numbers from the scorecard, use direct coaching language rather than motivational fluff, and return strictly formatted JSON objects.

### 4.3 Client-Side Optimizations

To keep the application highly performant and bundle sizes manageable:
* Tesseract.js is dynamically imported only when the user opens the Scorecard Scanner.
* Recharts and exporting tools are chunked separately via Vite's Rollup configuration.
* Deterministic calculations (like Season Form aggregation and the Choke Detector) run entirely in the browser using React hooks and stored `localStorage` data, minimizing API roundtrips.

---

## 5. Development Roadmap & Business Model

### 5.1 Project Status
**Phase 1 (MVP) is 100% complete.** All 17 planned features across post-match analysis and live match tools have been successfully implemented, tested, and deployed to production.

### 5.2 Future Phases
* **Phase 2:** Direct API integration with platforms like CricHeroes for automatic scorecard fetching. Full migration of match history from `localStorage` to Supabase PostgreSQL for multi-device sync. Transitioning to a Progressive Web App (PWA) for offline capability on poor mobile networks.
* **Phase 3:** Expanding into multi-sport support (e.g., Football, Kabaddi). Implementing automated opposition analysis when both teams use CoachLens, and adding an in-app coach-to-player messaging system.

### 5.3 Monetization Strategy
Operating on a Freemium model:
* **Free Tier:** Single match analysis, basic player cards, team pattern reports, and read-only access to Coach Tools.
* **Paid Tier (Rs. 99/team/month):** Multi-match trend tracking, shareable player cards, full Coach Decision Brief history, PDF/Instagram exports, and unlimited Live Match Assistant sessions.

With over 300,000 registered amateur teams in India, capturing just 1% of the market (3,000 teams) would result in an Annual Recurring Revenue (ARR) of over Rs. 35 Lakhs, built on a foundation with negligible infrastructure costs.

---

## 6. Conclusion

CoachLens successfully proves that elite-level sports analytics do not require elite-level budgets. By combining high-speed AI inference via Groq, smart prompt engineering, and a feature-rich, client-heavy React architecture, CoachLens delivers a paradigm-shifting tool for amateur cricket. It takes data that coaches already possess and turns it into the one thing they desperately need: insight.
