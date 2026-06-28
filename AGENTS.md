# AGENTS.md — DietGrid

Context file for AI agents. Read this before touching any code.
Covers architecture, design decisions, schema, and build state.

---

## 1. What This Project Is

**DietGrid** is a full-stack Progressive Web App (PWA) — a localized therapeutic diet planner.
Users generate macro-accurate meal plans that respect medical constraints (e.g. RA, anti-inflammatory)
using a curated database of real regional supermarket products (India and Australia).

Target scale: **1,000 – 10,000 concurrent users.**
Designed mobile-first. Installable from browser as a PWA.

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + TypeScript + Vite | PWA support via vite-plugin-pwa, fast HMR, typed |
| Styling | Tailwind CSS | Mobile-first utility classes, fast to build |
| State / fetching | TanStack React Query | Server state caching, auto error/loading, cache invalidation on mutation |
| Routing | React Router v6 | Industry standard, URL-based navigation for PWA |
| Database | PostgreSQL via Supabase | Relational, stable schema, better search than NoSQL for this use case |
| Auth + CRUD backend | Supabase | Auto-generated REST APIs, built-in JWT auth, RLS, managed infra — replaces boilerplate backend for all CRUD |
| AI backend | FastAPI (Python) | Only one custom endpoint needed; less boilerplate than Express, async-native, pairs well with AI calls |
| AI engine | Gemini API | Structured JSON output mode, handles dual-constraint meal generation |
| Data validation | Pydantic | Deeply integrated with FastAPI, runtime validation of both request inputs and Gemini JSON outputs |
| JWT verification | python-jose | Verifies Supabase-issued JWTs on the FastAPI endpoint before any Gemini call |
| HTTP client | httpx | Async HTTP for FastAPI; used if needed for external calls |
| Load balancing + CDN + Cache | Cloudflare | Replaces Redis — handles load balancing across FastAPI instances, edge caching of regional food list via Cloudflare KV, DDoS protection, automatic HTTPS, global edge network covering both IN and AU |

**Why Supabase over Django:** Django doesn't eliminate CRUD boilerplate and requires self-hosting. Supabase gives CRUD, auth, RLS, and managed PostgreSQL out of the box.

**Why Cloudflare over Redis:** Cloudflare solves load balancing AND caching in one service. Redis is only a cache and is single-region. Cloudflare KV is globally distributed — critical for serving Indian and Australian users with low latency. Also provides DDoS protection and rate limiting.

**Why JWTs over sessions:** Supabase uses JWTs natively. JWTs are stateless, which matches stateless FastAPI instances behind a load balancer. Sessions require a shared session store across instances.

**Why no message queues:** Nothing in the app is truly fire-and-forget async. The Gemini call takes up to 12 seconds but the user is waiting for the result, so queuing it provides no benefit.

**What was ruled out:** Next.js (replaces the modular stack with one framework — too opinionated for this setup), Express (more boilerplate than FastAPI, no advantage for one endpoint), Redis (replaced by Cloudflare KV), Django (too heavy, self-hosted).

---

## 3. Architecture Overview

```
User
 │
 ├── CRUD (meals, plans, users, regional list)
 │    └── Frontend → Supabase directly (auto-generated APIs + RLS)
 │
 └── AI Meal Generation
      └── Frontend → Cloudflare (load balancer)
                          └── FastAPI instance(s)
                                ├── Verify Supabase JWT (reject if invalid)
                                ├── Fetch regional food list from Cloudflare KV
                                │    └── Cache miss → query Supabase → repopulate KV
                                ├── Call Gemini API with constraints + regional list
                                ├── Validate macros mathematically (trust-but-verify)
                                └── Return plans to frontend
                                      └── If user saves → frontend sends to Supabase
```

**Key principle — Trust-But-Verify:**
Gemini curates meals from the regional food list. FastAPI independently recalculates
macros from the food item data after Gemini responds. If the maths doesn't match, the plan
is corrected before returning to the frontend. Gemini is never trusted blindly.

**Supabase handles:** All CRUD, auth, JWT issuance, connection pooling (Supavisor), RLS enforcement.
**Cloudflare handles:** Load balancing across FastAPI instances, KV edge cache for regional list, DDoS protection, HTTPS, rate limiting.
**FastAPI handles:** Only the AI generation flow. Nothing else.

---

## 4. Database Schema (PostgreSQL via Supabase)

### users
Managed mostly by Supabase Auth. Extended with region.
```sql
users (
  id          UUID PRIMARY KEY,  -- from Supabase auth
  name        TEXT,
  email       TEXT UNIQUE,
  region      TEXT,              -- 'IN' or 'AU'
  created_at  TIMESTAMPTZ DEFAULT NOW()
)
```

### user_profiles
Health and fitness constraints. Core input to AI generation.
```sql
user_profiles (
  user_id               UUID REFERENCES users(id),
  fitness_goal          TEXT,         -- 'bulk' | 'cut' | 'maintain'
  calorie_target        INTEGER,
  protein_target        FLOAT,
  carbs_target          FLOAT,
  fat_target            FLOAT,
  fiber_target          FLOAT,
  health_conditions     TEXT[],       -- e.g. ['RA', 'anti-inflammatory']
  required_food_items   TEXT[],       -- must-haves e.g. ['chai', 'dal']
  dietary_restrictions  TEXT[],       -- e.g. ['vegetarian']
  updated_at            TIMESTAMPTZ DEFAULT NOW()
)
```

### food_items
Source of truth for nutritional data. Per 100g values only.
```sql
food_items (
  id                  UUID PRIMARY KEY,
  name                TEXT NOT NULL,
  calories            FLOAT,
  protein_g           FLOAT,
  carbs_g             FLOAT,
  fat_g               FLOAT,
  fiber_g             FLOAT,
  is_custom           BOOLEAN DEFAULT FALSE,
  added_by            UUID REFERENCES users(id),  -- NULL if from Open Food Facts
  open_food_facts_id  TEXT,
  price_per_100g      FLOAT
)
```

**Note:** Micros are intentionally excluded. Gemini is trusted to handle micro-nutrient
optimisation. Macro deficiency is measurable and critical; micro imbalance for a short
period is acceptable and hard to validate given incomplete Open Food Facts data.

### regional_list
Junction table mapping food items to regions. Replaces a region field on food_items
so the same item (e.g. rice) can exist in multiple regions.
```sql
regional_list (
  id              UUID PRIMARY KEY,
  region          TEXT NOT NULL,        -- 'IN' | 'AU'
  food_item_id    UUID REFERENCES food_items(id),
  price_per_100g  FLOAT                 -- regional pricing differs
)
```

**Served via:** Cloudflare KV (cached as JSON blob per region).
Query to build the KV blob:
```sql
SELECT fi.*, rl.price_per_100g
FROM food_items fi
JOIN regional_list rl ON fi.id = rl.food_item_id
WHERE rl.region = 'IN'
```
On cache miss, FastAPI fetches from Supabase, repopulates KV, returns data.
On custom food item added, FastAPI invalidates the KV entry for that region.

### meals
User-created individual meals. Macro totals are pre-calculated and stored
to avoid recalculating on every read.
```sql
meals (
  id              UUID PRIMARY KEY,
  user_id         UUID REFERENCES users(id),
  name            TEXT NOT NULL,
  total_calories  FLOAT,
  total_protein_g FLOAT,
  total_carbs_g   FLOAT,
  total_fat_g     FLOAT,
  total_fiber_g   FLOAT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
)
```

### meal_ingredients
Normalised junction for meal → food item relationships.
```sql
meal_ingredients (
  id            UUID PRIMARY KEY,
  meal_id       UUID REFERENCES meals(id) ON DELETE CASCADE,
  food_item_id  UUID REFERENCES food_items(id),
  amount_grams  FLOAT NOT NULL
)
```

### day_diets
A full day's plan. Can be a template or a specific dated plan.
```sql
day_diets (
  id              UUID PRIMARY KEY,
  user_id         UUID REFERENCES users(id),
  name            TEXT,
  date            DATE,
  is_template     BOOLEAN DEFAULT FALSE,
  total_calories  FLOAT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
)
```

### day_diet_meals
Junction between a day diet and its meals. Tracks meal order and completion.
```sql
day_diet_meals (
  id            UUID PRIMARY KEY,
  day_diet_id   UUID REFERENCES day_diets(id) ON DELETE CASCADE,
  meal_id       UUID REFERENCES meals(id),
  meal_order    INTEGER,           -- 1=breakfast, 2=lunch, 3=dinner etc.
  is_completed  BOOLEAN DEFAULT FALSE  -- the "toggle meal done" feature
)
```

**No recommended_plans table.**
AI-generated plans are held in React frontend state (ephemeral).
If the user saves a plan, the frontend sends it to FastAPI which normalises it
into `meals` + `day_diets` + `day_diet_meals`. Plans lost on refresh — acceptable for MVP.

---

## 5. API Contracts

### Supabase (called directly from frontend — no backend involved)
| Operation | Table | Notes |
|---|---|---|
| getUserMeals | meals | RLS filters to current user |
| getUserPlans | day_diets | RLS filters to current user |
| createMeal | meals + meal_ingredients | Two inserts |
| updateMeal | meals + meal_ingredients | Update + cascade |
| createPlan | day_diets + day_diet_meals | Two inserts |
| updatePlan | day_diets + day_diet_meals | Update + cascade |
| toggleMealDone | day_diet_meals | Update is_completed |
| getRegional | food_items + regional_list | JOIN query |
| updateRegional | food_items + regional_list | Add/remove custom item |

### FastAPI (one endpoint, called from frontend via Cloudflare)

**POST /getRecommended**
```python
# Request (Pydantic validated)
class ConstraintInput(BaseModel):
    fitness_goal:          str        # 'bulk' | 'cut' | 'maintain'
    calorie_target:        int
    protein_target:        float
    carbs_target:          float
    fat_target:            float
    fiber_target:          float
    health_conditions:     list[str]
    required_food_items:   list[str]
    dietary_restrictions:  list[str]
    region:                str        # 'IN' | 'AU'

# Response
{
  "skipped_items": ["item that couldn't be included"],
  "plans": [
    {
      "plan_id": 1,
      "total_calories": 0,
      "total_protein_g": 0,
      "total_carbs_g": 0,
      "total_fat_g": 0,
      "total_fiber_g": 0,
      "meals": [
        {
          "name": "Breakfast",
          "ingredients": [
            {
              "food_item_id": "uuid",
              "name": "ingredient name",
              "amount_grams": 0,
              "calories": 0,
              "protein_g": 0,
              "carbs_g": 0,
              "fat_g": 0,
              "fiber_g": 0
            }
          ],
          "total_calories": 0,
          "total_protein_g": 0,
          "total_carbs_g": 0,
          "total_fat_g": 0,
          "total_fiber_g": 0
        }
      ]
    }
  ]
}
```

**POST /swapMeal** (meal-level swap)
Sends one meal + constraints → returns 3 alternative meals.
Same structure as a single meal object in the plan response.

Both endpoints require `Authorization: Bearer <supabase_jwt>` header.
JWT is verified via python-jose before any Gemini call is made.

---

## 6. AI Generation Design

### Stage 1 — Generate 3 diverse plans (one Gemini call)
Prompt instructs Gemini to produce meaningfully different plans:
one high-protein, one balanced, one culturally specific to the region.

### Stage 2 — Meal-level swap (targeted Gemini call)
Each meal card has a swap button. Sends only that meal + its macro target
+ regional list → returns 3 alternative meals. Fast, cheap, stateless.

### Gemini prompt structure
```
System: Expert dietician persona with therapeutic diet specialisation.
        Handles health conditions, dietary restrictions, daily macro targets,
        and must-have foods. If must-have can't be included, skip and report it.

Context: USER CONSTRAINTS (from ConstraintInput)
         AVAILABLE INGREDIENTS (regional list JSON — only these may be used,
         referenced by food_item_id)

Output: JSON only. No markdown. No explanation. Exact schema above.
```

### Macro validation (trust-but-verify)
After Gemini responds, FastAPI independently recalculates macros:
```
for each ingredient in each meal:
    contribution = (amount_grams / 100) * food_item.macro_value
sum contributions → compare to Gemini's reported totals
```
Correct if mismatch. Return validated plan.

---

## 7. Security

**Supabase RLS (Row Level Security)**
All tables have policies so users can only read/write their own rows.
Defined at the database level — enforced even if application code has a bug.
```sql
-- example
CREATE POLICY "users own meals"
ON meals FOR ALL
USING (auth.uid() = user_id);
```

**JWT flow**
1. User logs in via Supabase Auth → receives JWT (expires 1 hour, auto-refreshed by Supabase client)
2. Frontend attaches JWT to every FastAPI request: `Authorization: Bearer <token>`
3. FastAPI verifies signature using `SUPABASE_JWT_SECRET` via python-jose
4. Invalid/missing token → 401 before Gemini is touched

**Cloudflare**
DDoS protection is automatic — all traffic passes through Cloudflare before reaching
FastAPI instances. Custom rate limiting configured in Cloudflare dashboard
(e.g. max 10 AI generation requests per IP per minute to protect Gemini API credits).

---

## 8. Regional Food List

**Source:** Open Food Facts parquet dump (downloaded, not scraped live).
**Script:** `backend/scripts/seed_regional.py`
Parses the parquet file, filters by `countries_tags` for 'en:india' / 'en:australia',
excludes junk/ultra-processed categories, extracts macro data per 100g,
deduplicates by name, targets 300 items per region.
Outputs: `backend/data/regional_IN.json`, `backend/data/regional_AU.json`

**Loaded at FastAPI startup** into memory (`app.state.regional_lists`).
At scale with multiple instances and real-time updates (custom food items),
Cloudflare KV replaces in-memory loading — FastAPI calls KV on each request,
invalidates on regional list update.

**Custom food items:** User can add their own products.
Inserts into `food_items` + `regional_list` via Supabase directly from frontend.
If KV is active, FastAPI invalidates the KV entry for that region on the next
generation request (or via a dedicated endpoint).

---

## 9. Build Order

```
1. Schema + RLS policies in Supabase
2. Seed regional list (run seed_regional.py)
3. FastAPI skeleton — /getRecommended returning mock data
4. Auth — Supabase login/signup on frontend
5. CRUD features — frontend calls Supabase directly
      meals → meal_ingredients
      day_diets → day_diet_meals
      toggle is_completed
      add custom food item
6. AI generation — real Gemini integration + macro validator
7. Meal swap feature
8. Cloudflare setup — load balancer + KV + rate limiting + JWT hardening
9. Docker — containerise frontend and FastAPI for deployment
10. Scale testing (target: 1000 concurrent users)
```

---

## 10. Repo Structure

```
dietgrid/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/          # React Query hooks for Supabase calls
│   │   ├── lib/
│   │   │   └── supabase.ts # Supabase client init
│   │   └── types/          # Shared TypeScript types matching DB schema
│   ├── .env.local          # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
│   └── vite.config.ts
│
├── backend/
│   ├── main.py             # FastAPI app, single /getRecommended endpoint
│   ├── models.py           # Pydantic models (ConstraintInput, plan response)
│   ├── gemini.py           # Gemini call + prompt construction
│   ├── validator.py        # Macro recalculation and verification
│   ├── kv.py               # Cloudflare KV get/set/invalidate via Cloudflare SDK
│   ├── auth.py             # JWT verification via python-jose
│   ├── data/
│   │   ├── regional_IN.json
│   │   └── regional_AU.json
│   ├── scripts/
│   │   └── seed_regional.py
│   ├── .env                # SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
│   │                       # GEMINI_API_KEY, SUPABASE_JWT_SECRET,
│   │                       # CF_ACCOUNT_ID, CF_KV_NAMESPACE_ID, CF_API_TOKEN
│   └── requirements.txt
│
├── AGENTS.md               # this file
├── .gitignore
└── docker-compose.yml      # added at deployment phase
```

---

## 11. Environment Variables

### frontend/.env.local
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### backend/.env
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=          # Supabase dashboard → Project Settings → API → JWT Secret
GEMINI_API_KEY=
CF_ACCOUNT_ID=
CF_KV_NAMESPACE_ID=
CF_API_TOKEN=
```

---

## 12. Out of Scope (MVP)

- Live supermarket web scraping — food data is static from Open Food Facts parquet
- Live grocery cart / checkout integration
- Micro-nutrient mathematical validation — Gemini handles micros, only macros are validated
- Message queues — no fire-and-forget async work in the app
- Micro-nutrient display — deferred post-MVP
- Docker — added at deployment phase, not during development
