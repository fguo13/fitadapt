# FitAdapt

An adaptive fitness application that personalises every workout to the individual user using a continuously-updated overlay user model. Built for CS7IS5 (Team Pikachu).

---

## What it does

FitAdapt is a two-service progressive web app:

| Service | Description |
|---|---|
| **Frontend** | React 18 + Vite PWA — the UI the user interacts with |
| **FitAdaptService** | Spring Boot 3 REST API — holds all adaptation logic and the user model |

The system never generates the same workout twice. Every session is assembled fresh using a live user model that updates after each completed session.

---

## User journey

```
Register → Complete profile → Generate workout → Train → Log performance → Submit feedback
                                    ↑                                             |
                                    └─────────── BKT model updated ───────────────┘
```

1. **Register & onboard** — User creates an account and fills in their profile: goal, fitness level, workout style preference, equipment, and any injuries.

2. **Skill model seeded** — On first save, the backend seeds a Bayesian Knowledge Tracing (BKT) model from the self-reported fitness level (Stereotype → Overlay). An intermediate-level user immediately receives intermediate-difficulty exercises.

3. **Generate workout** — The backend runs a 3-pass BKT-informed selection algorithm across 8 muscle groups, picks exercises at the recommended difficulty, applies goal-based ordering and workout-style rep modifiers, and calculates suggested weights from the last 3 logged sessions.

4. **Train** — The user logs actual sets, reps, and weight for each exercise. Form cues are shown for intermediate and advanced exercises.

5. **Submit feedback** — After the session the user rates perceived difficulty (1–10) and fatigue (1–10). The backend:
   - Updates BKT mastery probabilities for every exercise completed
   - Generates a scrutable coaching insight explaining what will change next session
   - Checks if a deload week should be prescribed

6. **Repeat** — The next generated workout reflects updated mastery — harder exercises where the user has mastered the current level, lighter where they struggled, a recovery session if cumulative fatigue is detected.

---

## Adaptive features

### Bayesian Knowledge Tracing (BKT)
A **P(mastery)** probability is maintained for every `(MuscleGroup × DifficultyLevel)` pair per user, updated via Corbett & Anderson (1995). When P reaches 0.85, the system advances to the next difficulty level.

### Stereotype → Overlay transition
The onboarding `fitnessLevel` seeds starting BKT probabilities so users are not placed at BEGINNER regardless of experience. The model immediately diverges from the stereotype as real performance data accumulates.

### Workout style interests
A `workoutStyle` preference (`STRENGTH`, `HIIT`, `CARDIO`, `FLEXIBILITY`, `MIXED`) acts as a secondary signal: STRENGTH front-loads compound lifts and reduces reps; HIIT/CARDIO adds reps for a metabolic range. This is layered on top of the primary training goal.

### Adaptive progressive overload
Suggested weight for each exercise is calculated from the last 3 session logs:
- Overloaded or missed reps → −5%
- 3-session completion streak → +5 kg
- Comfortably completed → +2.5 kg
- Barely completed → hold

### Deload week detection
If rolling average perceived difficulty ≥ 7 **and** fatigue ≥ 7 over the last 3 weeks, the next workout is automatically prescribed as a recovery session with −1 set and −20% reps.

### Injury-aware exercise exclusion
The free-text `injuryHistory` field is parsed for keywords at generation time. Affected muscle groups are excluded from all exercise selection passes.

### Scrutable coaching insights
After each session, a rule-based coaching insight is generated from the current BKT state and recent trend — no LLM. The message explicitly references mastery percentages so the user can verify why the system made a recommendation.

---

## Running the app

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18+ |
| Java JDK | 17+ |
| PostgreSQL | 13+ |
| Redis | 6+ |

### 1. Start the backend

```bash
cd FitAdaptService

# Create the database (first time only)
psql -U postgres -c "CREATE DATABASE fitadapt;"

# Start Redis
docker run -d -p 6379:6379 redis:7   # or: redis-server

# Run the API (Flyway migrations run automatically)
mvn spring-boot:run
```

Backend starts on **http://localhost:8080**. See [`FitAdaptService/README.md`](FitAdaptService/README.md) for full configuration and API reference.

### 2. Start the frontend

```bash
npm install
npm run dev
```

Frontend starts on **http://localhost:5173**. API calls are proxied to `localhost:8080` via the Vite config.

---

## Frontend architecture

```
src/
├── App.jsx               — page router (custom useNavigation, no react-router)
├── contexts/
│   ├── AuthContext.jsx   — JWT storage + global 401 handler
│   └── ThemeContext.jsx  — dark/light theme toggle
├── services/
│   └── api.js            — typed fetch wrapper (all backend calls live here)
├── components/
│   ├── AppLayout/        — sidebar + topbar shell for authenticated pages
│   ├── TopBar/           — search bar + user dropdown
│   ├── Logo/, Chip/, FormField/, ProgressBar/
└── pages/
    ├── LoginPage/        — JWT login
    ├── RegisterPage/     — account creation + privacy disclosure
    ├── ProfileEditPage/  — full profile edit including workout style + stereotype note
    ├── ProfileViewPage/  — read-only profile summary
    ├── DashboardPage/    — greeting, stats, SKILL MODEL, recent sessions, generate CTA
    ├── WorkoutPage/      — active session: exercise cards, form cues, log inputs
    ├── FeedbackPage/     — post-session sliders + coaching insight card
    ├── WorkoutsPage/     — paginated session history
    └── SettingsPage/     — theme toggle, account controls
```

Navigation is handled by a `page` string in `App.jsx` state (no URL routing). Pages are unmounted when you leave them.

---

## Key UI flows

### Skill model (Dashboard)
The **SKILL MODEL** section shows each muscle group's current recommended difficulty and a progress bar toward mastering it (threshold: 85% P(L)). This makes the BKT model scrutable without exposing raw probabilities.

### Coaching insight (Feedback page)
After submitting feedback the page transitions to an **ALGORITHM UPDATED** view showing the coaching insight returned by the API. The user reads why difficulty will change, then taps **TO DASHBOARD →**.

### Form cues (Workout page)
INTERMEDIATE exercises show a "controlled movement" cue; ADVANCED exercises show a technique-failure warning. These are micro-interventions — they appear inline within the exercise card without interrupting flow.

### Stereotype scrutability (Profile edit)
A note under FITNESS LEVEL explains that it seeds the BKT model and can be adjusted at any time, giving users explicit control over the adaptation starting point.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, SCSS Modules |
| Styling | Dark theme (#0d0d0d), lime accent (#c8f135), Plus Jakarta Sans |
| Backend | Spring Boot 3.2, Spring Data JPA, Spring Security |
| Database | PostgreSQL 15 + Flyway migrations |
| Cache | Redis + Spring Cache |
| Auth | JWT (HMAC-SHA512, 24h TTL) |
| Adaptation | Bayesian Knowledge Tracing (Corbett & Anderson, 1995) |
