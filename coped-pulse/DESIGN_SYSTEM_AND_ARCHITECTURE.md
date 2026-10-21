# CoPED PULSE — System Architecture & Flat Design System Guide

> **Universiti Utara Malaysia (UUM) · CoPED PULSE**  
> *Platform for Ubiquitous Learning & Skills Enhancement*  
> **Branch:** `design-v2` | **Engine:** Laravel 13 · Inertia.js 3 · React 19 · Tailwind CSS v4  

---

## 1. Executive Summary & Purpose

**CoPED PULSE** is a monolithic server-driven Single-Page Application (SPA) Learning Management System (LMS) built for applied continuous professional development and university-accredited training programs.

The platform provides a dual-persona workflow:
1. **Instructors (Staff):** Manage their curriculum portfolio, author interactive courses, build practice quizzes and final assessments, and monitor learner progress from an uncluttered management studio.
2. **Learners:** Browse an institutional catalog, enroll in courses, study through a distraction-free 3-zone theater media player with auto-ticking telemetry, take interactive quizzes, and earn verifiable, printable certificates.

---

## 2. The Flat Design Poster System (Design Philosophy)

CoPED PULSE enforces a strict **Flat Design Poster System** inspired by Swiss graphic design and Open edX Studio. The interface is optimized for high information density, instant readability, and professional clarity.

```
┌─────────────────────────────────────────────────────────────┐
│  FLAT DESIGN POSTER SYSTEM (THE 4 NON-NEGOTIABLE RULES)     │
├─────────────────────────────────────────────────────────────┤
│  1. ZERO SHADOWS      No 'shadow-*' classes anywhere.       │
│                       Depth is achieved via 2px borders.    │
│  2. ZERO GRADIENTS    No 'bg-gradient-*'. Solid colors &    │
│                       subtle tinted pills only.             │
│  3. ZERO BLURS        No 'backdrop-blur*'. Opaque white     │
│                       surfaces with crisp dark outlines.    │
│  4. ZERO EM-DASHES    Never use '—' in UI strings.          │
│                       Use middle dot '·' or hyphen '-'.     │
└─────────────────────────────────────────────────────────────┘
```

### Key UI Rules
- **Solid Borders for Depth:** Elements sit inside `border-2 border-[#E5E7EB]` or `border-2 border-[#111827]`.
- **Single Solid Button Rule:** Each card or row allows at most **one** solid primary button (e.g., solid `#111827` or solid emerald `#10B981`). All other companion actions must be outline, ghost, or quiet text buttons.
- **Middle Dot Delimiters (`·`):** Metadata items on rows (e.g. `2026/2027 · RM150.00 · 4 modules`) are always separated by middle dots (`·`), never em-dashes (`—`).
- **Contextual State Badges:**
  - `Draft`: Amber pill (`bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]`)
  - `Published` / `Live`: Emerald pill (`bg-[#D1FAE5] text-[#065F46] border border-[#10B981]`)
  - `Archived`: Gray pill (`bg-[#F3F4F6] text-[#4B5563] border border-[#D1D5DB]`)

---

## 3. Typography & Color Tokens

### Typography Stack
Configured in `resources/css/app.css` via Tailwind v4 `@theme`:
- **Display & Headings:** `Outfit` (`font-display`, `font-extrabold`) — geometric, clean, authoritative.
- **Body & Controls:** `Instrument Sans` (`font-sans`) — crisp, modern, highly legible at small sizes.
- **Code & IDs:** `ui-monospace, monospace` — used for verification hashes, certificate IDs, and academic years.

### Base Color Tokens (`resources/css/app.css`)
| Token | Hex | Role | Usage |
|---|---|---|---|
| `--color-primary` | `#3B82F6` | Royal Blue | Informational links, focus rings, primary highlights |
| `--color-secondary` | `#10B981` | Emerald Green | Live state badges, deploy CTAs, success states, progress bars |
| `--color-accent` | `#F59E0B` | Warm Amber | Draft badges, pending quiz alerts, warnings |
| `--color-ink` | `#111827` | Classic Ink | Primary headers, dark CTA buttons, high-contrast text |
| `--color-muted` | `#F3F4F6` | Neutral Gray | Input backgrounds, inactive tab fills, secondary cards |
| `--color-line` | `#E5E7EB` | Neutral Border | 2px flat containers, table row borders, card borders |

---

## 4. The 6-Color Flat Theme System (`CourseLogoBadge.jsx`)

All courses in CoPED PULSE belong to a curated 6-color flat palette managed by `resources/js/Components/flat/CourseLogoBadge.jsx`. Industry-specific emblems have been replaced with a universal academic book icon (`BookIcon`) and university branding `UUM · CoPED`.

```
┌─────────────────────────────────────────────────────────────┐
│                 6 CURATED THEME COLORS                      │
├────────────┬─────────────┬─────────────┬────────────────────┤
│ Key        │ Name        │ Hex Code    │ Tailwind Fill      │
├────────────┼─────────────┼─────────────┼────────────────────┤
│ blue       │ Royal Blue  │ #3B82F6     │ bg-[#3B82F6]       │
│ emerald    │ Emerald     │ #10B981     │ bg-[#10B981]       │
│ amber      │ Warm Amber  │ #F59E0B     │ bg-[#F59E0B]       │
│ navy       │ Deep Navy   │ #1E3A8A     │ bg-[#1E3A8A]       │
│ rose       │ Crimson     │ #E11D48     │ bg-[#E11D48]       │
│ charcoal   │ Classic Ink │ #111827     │ bg-[#111827]       │
└────────────┴─────────────┴─────────────┴────────────────────┘
```

### Auto-Random Theme Assignment
- When an instructor creates a new course in `Staff/Courses/Create.jsx`, the system automatically invokes `getRandomThemeKey()` on initial render. If the instructor is in a hurry and skips picking a color, a theme color is already chosen.
- A **`[ 🎲 Random Color ]`** button allows instructors to cycle through colors with one click.
- Legacy seeded aliases (`maritime` → `navy`, `capm` → `amber`, `ai` → `blue`, `cybersecurity` → `emerald`, `general` → `charcoal`) automatically map to their respective solid color.

---

## 5. System Architecture & Tech Stack

```mermaid
graph TD
    subgraph Client Browser
        React[React 19 Components]
        InertiaClient[@inertiajs/react 3.8]
        Tailwind[Tailwind CSS v4]
    end

    subgraph Server (Laravel 13)
        Router[routes/web.php]
        AuthGuard[Session Auth Guard + RoleMiddleware]
        Controllers[Staff & Learner Controllers]
        Policies[CoursePolicy & Authorization]
        ORM[Eloquent Models: User, Course, Module, Lesson, Enrollment]
    end

    subgraph Database
        DB[(PostgreSQL / SQLite Database)]
    end

    React <-->|Inertia Bridge JSON| InertiaClient
    InertiaClient <-->|XHR / HTML Initial Load| Router
    Router --> AuthGuard
    AuthGuard --> Controllers
    Controllers --> Policies
    Controllers --> ORM
    ORM <--> DB
```

### Stack Details
- **Backend Framework:** Laravel 13.x (PHP 8.3+)
- **SPA Bridge:** Inertia.js 3.5 (No client-side router; pages swapped via server `Inertia::render()`)
- **Frontend Engine:** React 19.x with `@inertiajs/react`
- **Utility Routing:** Ziggy (`route('name', param)`) available directly in JSX
- **Styling Engine:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Build Tool:** Vite 8.x

---

## 6. Staff / Instructor Experience

### 1. Instructor Dashboard (`Staff/Dashboard.jsx`)
- **KPI Stats Cards (`StatCard.jsx`):** High-level metrics (Total Courses, Total Learners, Completion Rate) with clean SVG icons, eliminating duplicate numbers.
- **Active Courses Section:**
  - Segmented by **`Live ({count})`** and **`Drafts ({count})`** tabs.
  - Constrained to 3 items by default with a `▼ Show all {N} courses` expand toggle to prevent vertical column skew.
  - Delegated directly to the shared `<CourseRow variant="dashboard" />`.
- **"Needs Attention" Learner Feed:**
  - Header filter pills: `All`, `Pending quizzes`, and `Completed`.
  - Student deduplication to eliminate consecutive duplicate entries.
  - Clean 2-line rows with progress percentage and relative timestamps.

### 2. Courses Management Table (`Staff/Courses/Index.jsx`)
- Compact, high-density table optimized for managing courses rather than browsing them.
- **Control Bar:** Filter tabs (`All`, `Live`, `Drafts`) + Instant client-side search input with clear (`×`) button.
- **Sortable Columns:** Headers (`Course`, `Status`, `Students`, `Created`) can be sorted ascending or descending with visual indicator arrows (`↑` / `↓` / `↕`).
- **Reusable `<CourseRow variant="table" />`:**
  - Left icon tile with course theme color and `BookIcon`.
  - Title linking directly to the editor; `course.description` completely hidden to preserve row height.
  - Inline flat cohort progress bar (`w-20 h-1.5`) displayed **only** for published courses with enrollments.
  - Single solid CTA: `[Deploy Live]` (emerald) for drafts; `[Edit]` (solid dark) for live courses.
  - Accessible `⋯` overflow dropdown: `Preview as Learner`, `Manage Final Quiz`, divider, and `Delete`.
  - **Flat Delete Confirmation Modal:** Inline modal naming the specific course title with `[Cancel]` and solid red `[Confirm Delete]` (zero browser `window.confirm`).

### 3. Course Creation Wizard (`Staff/Courses/Create.jsx`)
A clean 3-step wizard with a real-time progress bar:
- **Step 1: Course Identity:** Course title, academic year / intake session, initial status, 6-color flat theme picker with auto-random default, and course description. *(Note: Bulk material pack / "Segedebuk" has been completely removed).*
- **Step 2: Subscription Model:** Simplified 2-option model:
  1. `Free Institutional Course` (`billing_type = 'free'`, RM 0.00)
  2. `Paid / Commercial Course` (`billing_type = 'one_time'`, custom price in RM)
- **Step 3: Industry Certification & Summary:** Link to external credentials (e.g. CAPM®, JLM) and summary review card before saving.

### 4. Module Studio (`Staff/Modules/Edit.jsx`)
- Replaces long vertically stacked forms with clean action cards:
  - **Card 1: Module Details & Materials:** Title, duration, and subtopics authoring.
  - **Card 2: Module Practice Quiz:** Multiple choice questions with instant answer key validation.
  - **Card 3: Final Course Assessment:** Comprehensive exam questions leading to certification.
- Preserves active tab and sub-tab state across Inertia reloads so instructors are never bounced back to Card 1 after saving questions.

---

## 7. Learner Experience

### 1. Course Catalog (`Learner/Catalog.jsx`)
- Public or authenticated course browsing with category filtering, keyword search, and instructor attribution.
- Instant modal checkout for paid commercial courses and one-click enrollment for institutional courses.

### 2. Learner Portal (`Learner/Portal.jsx`)
- Unified student dashboard displaying active enrollments, percentage progress bars, and direct `[Resume Learning →]` CTAs.

### 3. 3-Zone Theater Learning Experience (`Learner/Course/Learn.jsx`)
- **Zone 1 (Theater Player):** Embedded responsive YouTube and video player with auto-ticking completion telemetry.
- **Zone 2 (Curriculum Navigator):** Collapsible module tree with active indicators and completed subtopic checkmarks.
- **Zone 3 (Interactive Assessment):** Inline practice quizzes with instant grade calculation and pass/fail telemetry.

### 4. Verifiable Certificate (`Learner/Course/Certificate.jsx`)
- Automatically unlocked upon achieving 100% curriculum progress and passing the final assessment.
- Single-page print-optimized document (`@media print` rules remove headers, sidebars, and navigation).
- Displays learner name, course title, completion date, unique verification ID (`COPED-{enrollment_id}-{course_id}`), and official university signature seals.

---

## 8. Directory & Component Structure

```
coped-pulse/
├── app/
│   ├── Http/Controllers/
│   │   ├── Staff/
│   │   │   ├── CourseController.php      # Course CRUD + eager aggregations
│   │   │   └── ModuleController.php      # Modules & curriculum authoring
│   │   └── Learner/
│   │       ├── CatalogController.php     # Course catalog & enrollment
│   │       └── CourseController.php      # Learning theater & telemetry
│   └── Models/
│       ├── User.php                      # Staff & learner roles
│       ├── Course.php                    # Course aggregate root
│       ├── Module.php                    # Curriculum chapters
│       ├── Lesson.php                    # Granular subtopics / materials
│       ├── Enrollment.php                # Student progress & completion
│       └── Question.php                  # Quiz & final exam questions
├── resources/
│   ├── css/
│   │   └── app.css                       # Design tokens, fonts & keyframes
│   └── js/
│       ├── Components/flat/
│       │   ├── CourseLogoBadge.jsx       # 6-color theme palette & BookIcon
│       │   ├── FlatButton.jsx            # Standardized flat buttons
│       │   ├── FlatCard.jsx              # 2px border container
│       │   ├── FlatInput.jsx             # Accessible input fields
│       │   └── icons.jsx                 # Flat SVG icon library
│       └── Pages/design_v1/
│           ├── Staff/
│           │   ├── Dashboard.jsx         # Instructor KPI & activity feed
│           │   └── Courses/
│           │       ├── Index.jsx         # Management table
│           │       ├── Create.jsx        # 3-step creation wizard
│           │       ├── Edit.jsx          # Course settings & hub
│           │       └── Partials/
│           │           ├── CourseRow.jsx # Shared dual-mode row (table/dashboard)
│           │           └── StatCard.jsx  # Page-level KPI card
│           └── Learner/
│               ├── Catalog.jsx           # Course browsing & checkout
│               ├── Portal.jsx            # Student dashboard
│               └── Course/
│                   ├── Learn.jsx         # 3-zone learning theater
│                   └── Certificate.jsx   # 1-page printable credential
└── tests/
    └── Feature/
        ├── StaffCourseTest.php           # 14+ course lifecycle tests
        └── LearnerCourseTest.php         # Enrollment & telemetry tests
```

---

## 9. Developer Workflow & CLI Commands

> [!IMPORTANT]
> All build and artisan commands MUST be executed inside the **`coped-pulse/`** subdirectory (where `package.json` and `artisan` reside), not the outer workspace root.

```bash
# Navigate to the application root
cd coped-pulse

# Compile frontend assets for production
npm run build

# Start local development server with Vite hot reloading
npm run dev

# Run full test suite (Token-optimized via rtk)
rtk php artisan test

# Verify Flat Design compliance (Check for forbidden styles)
git diff resources/js/ | grep -E '^\+[^+]' | grep -E 'shadow-|bg-gradient-|backdrop-blur|—'
```

---

## 10. Quality Assurance & Standards Summary

- **Automated Tests:** 103/103 PHPUnit tests passing (326 assertions) across authorization, course lifecycle, enrollment, and theme color validation.
- **Frontend Build:** Clean Vite build transforming 671 modules in ~720ms with 0 errors.
- **Style Compliance:** 100% adherence to the Flat Design Poster System (0 shadows, 0 gradients, 0 blurs, 0 em-dashes).
