# BioSecure Farm Portal

A role-based farm biosecurity management system for tracking cleaning compliance, disease monitoring, and worker access via barcode scanning.

---

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 19 (with Hooks, functional components only) |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS 3 |
| **Routing** | React Router DOM 7 |
| **Icons** | react-icons (Feather Icons) |
| **Backend / Database** | Supabase (PostgreSQL, REST API) |
| **Barcode Generation** | jsbarcode + react-barcode |
| **Barcode Scanning** | html5-qrcode |
| **QR Code** | qrcode.react |
| **Language** | JavaScript (ES Modules) |

---

## Project Structure

```
biosecure-farm/
├── .env                          # Supabase credentials
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx                  # App entry point
    ├── index.css                 # Tailwind directives + custom styles
    ├── App.jsx                   # Root component
    ├── services/
    │   └── supabase.js           # Supabase client instance
    ├── utils/
    │   ├── auth.js               # Login/logout, role maps, session storage
    │   ├── workerStorage.js      # Supabase CRUD for workers table
    │   ├── entryLogStorage.js    # localStorage CRUD for scanner entry logs
    │   ├── cleaningStorage.js    # localStorage CRUD for cleaning reports
    │   └── diseaseStorage.js     # localStorage CRUD for disease reports
    ├── components/
    │   ├── ProtectedRoute.jsx    # Auth guard + role-based redirect
    │   ├── WorkerForm.jsx        # Create worker form (name, mobile, role, area, userId, password)
    │   └── WorkerList.jsx        # Worker table with barcode + delete
    ├── layouts/
    │   └── MainLayout.jsx        # Responsive navbar + content wrapper
    ├── pages/
    │   ├── LoginPage.jsx         # User ID / password login
    │   ├── AdminDashboard.jsx    # Stats, worker management, report panels
    │   ├── CleaningPage.jsx      # Daily cleaning tasks checklist
    │   ├── DiseasePage.jsx       # Daily symptom reporting + risk scoring
    │   └── ScannerPage.jsx       # Live barcode camera scanner + manual entry
    └── routes/
        └── index.jsx             # Route definitions with role protection
```

---

## Database Schema (Supabase)

### `workers` table

```sql
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_code TEXT NOT NULL,
  name TEXT NOT NULL,
  mobile TEXT,
  role TEXT NOT NULL,
  assigned_area TEXT,
  user_id TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Roles & Access

| Role | Default Login | Accessible Pages |
|---|---|---|
| **Admin** | `ADMIN` / `admin123` (hardcoded) | Dashboard (`/admin`), Scanner (`/scanner`) |
| **Cleaner** | Created via Admin → Supabase | Cleaning (`/cleaning`) |
| **Disease Monitor** | Created via Admin → Supabase | Disease (`/disease`) |

- Admin is hardcoded in `auth.js` and bypasses Supabase.
- All other workers are stored in the Supabase `workers` table.
- Login validates `user_id` + `password` against the database.
- Role-based routing: each role sees only their permitted nav links.

---

## Features

### 1. Admin Dashboard (`/admin`)

- **Stats cards**: Active Workers, Cleaners, Disease Staff, Scans Today
- **Zones in Danger**: Shows areas with HIGH RISK disease reports (red alert box)
- **Worker Management**:
  - Create workers (name, mobile, role, area, userId, password)
  - Auto-generated worker code (`CLN-001`, `DIS-002`, etc.)
  - One person per area constraint (area taken = error message)
  - 10 assignable areas: Poultry Area A/B/C, Pig Shed A/B/C, Cattle Barn, Goat Pen, Feed Storage, Quarantine Zone
  - Worker table with CODE128 barcode, download PNG, delete
- **Cleaning Reports panel**: Live feed of last 8 reports with Safe/Warning/Critical badges, CSV export
- **Disease Reports panel**: Live feed of last 8 reports with risk level badges, CSV export
- **Refresh button**: Re-reads all data from localStorage and Supabase

### 2. Cleaning Compliance (`/cleaning`)

- Area-aware task checklist (poultry tasks vs pig shed tasks)
- Compliance percentage with progress bar
- Status labels: Safe (≥80%), Warning (50-79%), Critical (<50%)
- One report per day (prevents duplicate submissions)
- Recent reports list (last 5)
- Toast notification on submit

**Poultry tasks**: Footbath cleaned, Feed trays sanitized, Cage disinfected, Waste removed
**Pig shed tasks**: Pen cleaned, Water area sanitized, Disinfectant sprayed, Waste removed

### 3. Disease Monitoring (`/disease`)

- Area-aware symptom inputs (poultry vs pig symptoms)
  - Poultry: Sick Birds (×1), Coughing (×2), Not Eating (×2), Found Dead (×5)
  - Pigs: Sick Pigs (×1), Fever (×2), Skin Sores (×2), Found Dead (×5)
- **Total Dead Today** — free-text number input for overall daily mortality
- **Risk score** = weighted sum of all symptom counts
- **Risk levels**: SAFE (≤3), WARNING (4-8), HIGH RISK (9+)
- Alert cards for high mortality, HIGH RISK, and WARNING levels
- Risk score breakdown display
- One report per day
- Recent reports table with CSV export

### 4. Barcode Scanner (`/scanner`)

- Live camera scanner using `html5-qrcode`
- Continuous scanning (no restart after scan, 2-second cooldown per code)
- Green flash overlay + success popup on valid scan
- Manual code entry fallback
- Entry log table (today's entries: code, name, role, area, time)
- CSV export of today's logs

### 5. Worker Barcodes

- Each worker gets a CODE128 barcode generated with `react-barcode`
- Download barcode as PNG via `jsbarcode` canvas rendering
- Barcode value = worker code (e.g. `CLN-001`)

---

## Page Flow

```
/ (redirect) ──→ /login
                    │
                    ├── ADMIN login ──→ /admin (Dashboard)
                    │                      ├── Create workers (saved to Supabase)
                    │                      ├── View cleaning/disease report panels
                    │                      └── Navigate to /scanner
                    │
                    ├── Cleaner login ──→ /cleaning
                    │                      ├── Check cleaning tasks
                    │                      └── Submit daily compliance report
                    │
                    └── Disease login ──→ /disease
                                           ├── Enter symptom counts
                                           ├── Enter total dead
                                           └── Submit daily disease report
```

- All authenticated pages are wrapped in `ProtectedRoute` (redirects to `/login` if no session)
- Role mismatch redirects to the user's default route
- Logout clears session from localStorage and redirects to `/login`

---

## Data Persistence

| Data | Storage |
|---|---|
| Workers | **Supabase** (`workers` table) |
| User session | `localStorage` (`biosecure_user`) |
| Scanner entry logs | `localStorage` (`biosecure_entry_logs`) |
| Cleaning reports | `localStorage` (`biosecure_cleaning_reports`) |
| Disease reports | `localStorage` (`biosecure_disease_reports`) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with the `workers` table created (see schema above)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure Supabase
# Create/update .env with your project credentials:
#   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
#   VITE_SUPABASE_ANON_KEY=<your-anon-key>

# 3. Run the SQL in Supabase SQL Editor
# (see Database Schema section above)

# 4. Start dev server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## Design Conventions

- **Color scheme**: Green/white enterprise dashboard (emerald-600 primary)
- **Layout**: Max-width container (`max-w-7xl`), centered content
- **Responsive**: Mobile-first with hamburger menu, responsive grids
- **No animations** (except spinner loading states)
- **No external state management** (React state only, no Redux/Context)
- **Functional components only**, no class components
