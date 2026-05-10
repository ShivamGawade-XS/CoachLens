# Design Document
# CoachLens — UI/UX Design System & Component Specifications

**Version:** 1.0  
**Authors:** Crimson Syndicate (Shivam Mahesh Gawade, Ashwith Ashok Shetty, Rahul Ravi Rathod)  
**Hackathon:** GBOA Code Premier League 2026 — Round 2

---

## 1. Design Philosophy

### 1.1 Core Principle
CoachLens is a **utility-first intelligence tool**, not a sports entertainment app. The design must feel like a *professional coaching instrument* — not a cricket scoreboard, not a fantasy app.

### 1.2 Design Direction: **Sports Operations / War Room**
Inspired by tactical dashboards used in professional sports analysis rooms. Dark theme. High-density information. Clinical, not flashy. Every element earns its place.

**Mood:** Precise. Authoritative. Fast. Built for decision-makers who have 5 minutes post-match before players scatter.

**Anti-patterns to avoid:**
- No cricket pitch greens or generic sports palettes
- No confetti animations or celebration UI
- No vague donut charts or decorative data viz
- No card shadows that look like a portfolio template

---

## 2. Colour System

```
Primary Background:    #0D0F12   (near-black — ops room feel)
Surface Level 1:       #141720   (card backgrounds)
Surface Level 2:       #1C2030   (input fields, secondary panels)
Border / Divider:      #2A2F3E   (subtle separation)

Brand Accent:          #E8A020   (amber — cricket ball orange-gold)
Brand Accent Hover:    #F0B040

Text Primary:          #F0F2F6   (off-white)
Text Secondary:        #8B93A8   (muted label text)
Text Tertiary:         #4A5268   (placeholder, timestamps)

-- Performance Tag Colours --
Aggressor:   #22C55E  (emerald green) — bg: #0F2A1A
Anchor:      #3B82F6  (blue)          — bg: #0F1E35
Improving:   #EAB308  (yellow)        — bg: #2A2200
Liability:   #EF4444  (red)           — bg: #2A0F0F

-- Functional --
Success:     #22C55E
Warning:     #EAB308
Error:       #EF4444
Loading:     #6366F1  (indigo pulse)
```

---

## 3. Typography

```
Display / Headings:    'DM Serif Display' (Google Fonts)
                       — gravitas, editorial weight
                       
UI / Body:             'IBM Plex Mono' (Google Fonts)
                       — technical, data-accurate feel
                       — reinforces "this is a precision tool"
                       
Numbers / Stats:       'IBM Plex Mono' tabular variant
                       — all stat values rendered in mono
```

**Type Scale:**

| Token | Size | Weight | Usage |
|---|---|---|---|
| `display-xl` | 32px | 400 | Page titles |
| `display-lg` | 24px | 400 | Section headers |
| `heading-md` | 18px | 600 | Card player name |
| `body-md` | 14px | 400 | Analysis text |
| `body-sm` | 12px | 400 | Labels, metadata |
| `mono-stat` | 20px | 700 | Key numbers (runs, wickets) |
| `mono-sm` | 12px | 500 | Inline stat references |

---

## 4. Layout System

### 4.1 Grid
- Desktop: 12-column grid, 24px gutters, max-width 1200px
- Tablet: 8-column, 16px gutters
- Mobile: 4-column, 16px gutters (primary device for coaches)

### 4.2 Spacing Scale
```
4px   — micro (icon gaps, tag padding)
8px   — tight (form element internal)
12px  — snug (card internal)
16px  — base (component margin)
24px  — comfortable (section separation)
32px  — spacious (panel gaps)
48px  — large (page section breaks)
```

### 4.3 Border Radius
```
4px   — inputs, small tags
8px   — cards, buttons
12px  — large panels
0px   — deliberate: Coach Decision Brief (hard edges = authority)
```

---

## 5. Screen Designs

### 5.1 Screen 1 — Dashboard (Landing)

**Layout:** Left sidebar (match history list) + Right main panel (empty state or last analysis)

```
┌─────────────────────────────────────────────────────────────────┐
│  COACHLENS                              [+ New Analysis]  ⚙     │
├──────────────────┬──────────────────────────────────────────────┤
│  MATCH HISTORY   │                                              │
│  ─────────────   │          No match selected.                  │
│  05 May 2026     │                                              │
│  Panaji Panthers │    Paste a scorecard to start analysis.      │
│  Won · T20       │                                              │
│                  │              [+ New Analysis]                │
│  02 May 2026     │                                              │
│  Margao Strikers │                                              │
│  Lost · T20      │                                              │
│                  │                                              │
│  28 Apr 2026     │                                              │
│  Vasco Warriors  │                                              │
│  Won · T20       │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

**Empty state copy:** "No analysis yet. Paste your scorecard after your next match."

---

### 5.2 Screen 2 — Scorecard Input

**Layout:** Full-width centered form, max-width 680px

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back                   New Match Analysis                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Match Format         T20  ●  |  ○  ODI                        │
│                                                                 │
│  Phase Focus          ○ Full Match  ● Powerplay  ○ Death        │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  Paste scorecard here...                                  │  │
│  │  (CricHeroes format, plain text, or any structured data)  │  │
│  │                                                           │  │
│  │                                                           │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [ Enter manually instead ]                                     │
│                                                                 │
│                              ┌──────────────────────────────┐   │
│                              │      ▶  ANALYZE MATCH        │   │
│                              └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Analyze button:** Full-width on mobile. Amber (#E8A020) fill. No border-radius (authority signal). Monospace text, uppercase: `ANALYZE MATCH`.

---

### 5.3 Screen 3 — Loading State

Full-screen overlay. Centered.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│                    ◐  Analyzing match...                        │
│                                                                 │
│            Running player pattern analysis                      │
│            Identifying team scoring trends                      │
│            Building coach decision brief                        │
│                                                                 │
│                         [ ████████░░ ]                          │
│                           8 seconds                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Animation:** Spinning half-circle indicator (CSS). Progress bar fills linearly over 8 seconds. Steps reveal sequentially with 1.5s delay each.

---

### 5.4 Screen 4 — Analysis Results

**Tab navigation:** `Players` | `Team Report` | `Coach Brief`

#### 5.4.1 Players Tab

```
┌─────────────────────────────────────────────────────────────────┐
│  Players  |  Team Report  |  Coach Brief                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────┐                        │
│  │  ● RAHUL SHARMA        [LIABILITY]  │  ← Red tag            │
│  │  Batsman · #3                       │                        │
│  │  ─────────────────────────────────  │                        │
│  │  ✓ WHAT WORKED                      │                        │
│  │  Scored 19 off 28 balls.            │                        │
│  │  Held crease during collapse.       │                        │
│  │                                     │                        │
│  │  ✗ WHAT FAILED                      │                        │
│  │  61% dot ball rate in powerplay.    │                        │
│  │  Highest in team. SR of 67.8.       │                        │
│  │                                     │                        │
│  │  → NEXT MATCH                       │                        │
│  │  Drop to #5. SR target: 100+        │                        │
│  │  in powerplay or sit out.           │                        │
│  │                                     │                        │
│  │  ◉ DRILL                            │                        │
│  │  Powerplay aggression nets —        │                        │
│  │  8-ball sequences, no dot balls.    │                        │
│  │                                     │                        │
│  │                      [Share Card ↗] │                        │
│  └─────────────────────────────────────┘                        │
│                                                                 │
│  ┌─────────────────────────────────────┐                        │
│  │  ● VIKAS PATEL         [AGGRESSOR]  │  ← Green tag          │
│  │  ...                                │                        │
│  └─────────────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

**Card anatomy:**
- Left border: 3px solid — coloured by performance tag
- Player name: `heading-md`, `DM Serif Display`
- All stat values: `IBM Plex Mono`, amber highlight
- Section labels (WHAT WORKED, WHAT FAILED): monospace, uppercase, 10px letter-spacing, secondary text colour
- Share Card button: ghost button, secondary colour, top-right corner

---

#### 5.4.2 Team Report Tab

```
┌─────────────────────────────────────────────────────────────────┐
│  Players  |  Team Report  |  Coach Brief                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MATCH TURNING POINT                                            │
│  ─────────────────────────────────────────────────────────      │
│  Over 14.3 — Vikas dismissed for 34. Required rate jumped       │
│  from 8.2 to 11.4. Match effectively over from this point.     │
│                                                                 │
│  STRONGEST PARTNERSHIP                                          │
│  ─────────────────────────────────────────────────────────      │
│  Rohit & Suresh — 54 runs, overs 8–14                          │
│                                                                 │
│  BOWLING INEFFICIENCY                                           │
│  ─────────────────────────────────────────────────────────      │
│  Dev Kumar — 4 overs, 54 runs (ER: 13.5). Bowled 3             │
│  consecutive overs in the death. Should not bowl past over 16. │
│                                                                 │
│  TEAM PATTERN                                                   │
│  ─────────────────────────────────────────────────────────      │
│  Team scores 68% of runs in overs 7–15. Powerplay avg SR       │
│  of 89 is below par for this format. Top order needs to        │
│  target SR 120+ in overs 1–6.                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

#### 5.4.3 Coach Brief Tab

```
┌─────────────────────────────────────────────────────────────────┐
│  Players  |  Team Report  |  Coach Brief                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  PRE-MATCH DECISION BRIEF             [Export PDF ↓]   │    │
│  │  ─────────────────────────────────────────────────────  │    │
│  │                                                         │    │
│  │  01  BATTING ORDER                                      │    │
│  │      Move Rahul from #3 → #5.                           │    │
│  │      61% dot ball rate makes him unsuitable for         │    │
│  │      top order in powerplay.                            │    │
│  │                                                         │    │
│  │  02  BOWLING ROTATION                                   │    │
│  │      Dev Kumar: max 2 overs in death (cap at over 17).  │    │
│  │      ER of 13.5 in overs 17–20 is unsustainable.        │    │
│  │                                                         │    │
│  │  03  PLAYER ON NOTICE                                   │    │
│  │      Karan Nair — 3 consecutive single-digit scores.   │    │
│  │      One more similar performance = dropped.            │    │
│  │                                                         │    │
│  │  04  TACTICAL FOCUS                                     │    │
│  │      Powerplay SR target 120+ for top 3.                │    │
│  │      Execute or restructure batting order next week.    │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

**Coach Brief card:** Deliberately styled differently — zero border-radius, amber left border (full height), monospace numbered list. Looks like an official briefing document.

---

### 5.5 Screen 5 — Shareable Player Card

Rendered by html2canvas. Optimised for WhatsApp thumbnail (1080x1080 or 1080x1920).

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  COACHLENS                                     ── ○ ──          │
│  POST-MATCH PLAYER REPORT                                       │
│                                                                 │
│  RAHUL SHARMA                     [LIABILITY]                   │
│  Panaji Panthers · T20 · 05 May 2026                            │
│  ─────────────────────────────────────────────────────────      │
│                                                                 │
│  19 runs  ·  28 balls  ·  SR 67.8  ·  61% dots                 │
│                                                                 │
│  WHAT TO WORK ON NEXT PRACTICE:                                 │
│  Powerplay aggression — 8-ball nets, SR target 110+             │
│                                                                 │
│  NEXT MATCH:                                                    │
│  Batting #5 (stabilizer role, overs 7–15)                       │
│                                                                 │
│  ─────────────────────────────────────────────────────────      │
│  Sent privately by coach.                   coachlens.app       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Component Specifications

### 6.1 PerformanceTag

```jsx
// Props: tag: "Aggressor" | "Anchor" | "Improving" | "Liability"
const tagConfig = {
  Aggressor: { bg: "#0F2A1A", text: "#22C55E", border: "#22C55E" },
  Anchor:    { bg: "#0F1E35", text: "#3B82F6", border: "#3B82F6" },
  Improving: { bg: "#2A2200", text: "#EAB308", border: "#EAB308" },
  Liability: { bg: "#2A0F0F", text: "#EF4444", border: "#EF4444" }
};
```

**Dimensions:** `px-3 py-1`, 11px monospace uppercase, 1px solid border, 2px border-radius.

---

### 6.2 AnalyzeButton

**States:**

| State | Appearance |
|---|---|
| Default | Amber fill, white mono uppercase text, 0 border-radius |
| Hover | Amber +10% brightness, cursor pointer |
| Loading | Gray fill, spinner icon, "ANALYZING…" text, disabled |
| Error | Red fill, "RETRY" text |

---

### 6.3 PlayerCard

**Structure:**
```
┌ [3px left border — tag colour] ───────────────────────────────┐
│  Name (DM Serif Display, 18px)       [PerformanceTag]          │
│  Role · Position (mono, 12px, secondary)                      │
│  ─────────────────────────────────────────────────────────    │
│  WHAT WORKED (label)                                           │
│  [text — body-md]                                              │
│                                                                │
│  WHAT FAILED (label)                                           │
│  [text — body-md]                                              │
│                                                                │
│  NEXT MATCH (label)                                            │
│  [text — body-md, amber accent on key stat]                    │
│                                                                │
│  DRILL (label)                                                 │
│  [text — body-md]                                              │
│                                                               │
│                                     [Share Card ↗] (ghost)    │
└────────────────────────────────────────────────────────────────┘
```

---

## 7. Responsive Behaviour

| Breakpoint | Layout |
|---|---|
| Mobile (< 640px) | Single column, full-width cards, tab nav becomes scrollable |
| Tablet (640–1024px) | Single column, wider cards, sidebar collapses to top bar |
| Desktop (> 1024px) | Split-panel dashboard, player cards in 2-column grid |

**Mobile-first priority.** Coaches will most likely open CoachLens immediately post-match on a phone. Every screen must be fully functional at 375px viewport width.

---

## 8. Motion & Animation

| Element | Animation | Duration |
|---|---|---|
| Analyze button click | Scale down 0.95 → 1.0 | 100ms |
| Loading progress bar | Linear fill | 8s |
| Loading steps | Sequential fade-in with delay | 1.5s each |
| Player cards reveal | Stagger fade-up (translateY 12px → 0) | 200ms per card, 80ms delay between |
| Tag badge | Pop scale 0.8 → 1.05 → 1.0 | 250ms |
| Tab switch | Fade cross-dissolve | 150ms |

**No looping animations in results view.** Once data is shown, the UI is static and scannable. Motion is used only for reveal, not for decoration.

---

## 9. Error & Edge Case States

| Scenario | UI Response |
|---|---|
| Empty scorecard submitted | Inline error: "Please paste a scorecard or enter player stats before analyzing." |
| API failure | Toast: "Analysis failed. Using saved response." — loads fallback silently |
| Insufficient players (< 3) | Warning banner: "Analysis may be limited — fewer than 3 players detected." |
| JSON parse failure | Error screen with retry button and "Contact support" link |
| No match history | Empty state illustration (minimal cricket stumps icon SVG) + CTA |

---

## 10. Accessibility

- All colour contrast ratios meet WCAG AA (minimum 4.5:1 for body text)
- Tag colours supplemented with text labels — never colour-only distinction
- All interactive elements have visible focus rings (amber outline)
- Loading state announces via `aria-live="polite"` for screen readers
- `alt` text on all icons and images
- Minimum tap target: 44x44px on all mobile interactive elements
