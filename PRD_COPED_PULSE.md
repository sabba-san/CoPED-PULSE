# PRODUCT REQUIREMENTS DOCUMENT (PRD)

```
==================================================================================================
DOCUMENT TITLE    : CoPED PULSE — Product Requirements Document (PRD)
SYSTEM NAME       : Professional Upskilling & Learning System for External Engagement (CoPED PULSE)
ORGANIZATION      : Computing Professional Enrichment & Development Division (CoPED)
                    School of Computing, College of Arts and Sciences
                    Universiti Utara Malaysia (UUM), Sintok, Kedah, Malaysia
DOCUMENT VERSION  : 2.4.0 (Final Architecture & Production Specification)
DATE OF ISSUE     : October 2026
LEAD ARCHITECT    : Ahmad Abbas Bin Abu Dzarr
SUPERVISORS       : Mr. Mohd. Rushdi Idrus & Dr. Muhammad Syafiq bin Mohd Pozi
TARGET AUDIENCE   : CoPED Executive Management, Academic Supervisors, Systems Architects,
                    Full-Stack Engineers, QA Teams, External Corporate Partners
==================================================================================================
```

---

## 1. Document Control & Executive Summary

### 1.1 Document Metadata & Approval History

| Attribute | Details |
|---|---|
| **Document Reference** | `UUM/SOC/COPED/PRD-2026-V2.4` |
| **System Classification** | Enterprise Learning Management & Certification Single-Page Application (SPA) |
| **Document Classification** | Institutional Confidential — Academic & Engineering Baseline |
| **Lead Author & System Architect** | Ahmad Abbas Bin Abu Dzarr (*Software Engineering Specialization, School of Computing, UUM*) |
| **Project & Academic Supervisors** | **Mr. Mohd. Rushdi Idrus** (*Senior Lecturer & Academic Supervisor, School of Computing, UUM*)<br/>**Dr. Muhammad Syafiq bin Mohd Pozi** (*Senior Lecturer & Technical Supervisor, School of Computing, UUM*) |
| **Operating Division** | Computing Professional Enrichment & Development Division (CoPED), School of Computing, Universiti Utara Malaysia |
| **Current Target Version** | `Release 2.4.0-LTS` (Laravel 13.x, Inertia.js 3.5, React 19.x, Tailwind CSS v4.x) |
| **Sign-Off Authority** | CoPED Executive Board, School of Computing Academic Curriculum Committee |

#### Document Revision Ledger
| Version | Date | Primary Author | Description of Key Enhancements |
|---|---|---|---|
| `v1.0.0` | May 2026 | Ahmad Abbas Bin Abu Dzarr | Initial proof-of-concept PRD; basic 2-role LMS specification (staff/learner). |
| `v1.8.0` | July 2026 | Ahmad Abbas Bin Abu Dzarr | Integration of 3-Zone Theater Player, Open edX media paradigms, and verifiable certificates. |
| `v2.0.0` | August 2026 | Ahmad Abbas Bin Abu Dzarr | Adoption of the strict Flat Design Poster System (0 shadows, 0 gradients, 0 blurs, 0 em-dashes). |
| `v2.2.0` | September 2026 | Ahmad Abbas Bin Abu Dzarr | Specification of Subject Coordinator RBAC, 3-step creation wizard, and 5-tab unified course studio canvas. |
| `v2.4.0` | October 2026 | Ahmad Abbas Bin Abu Dzarr | Production-ready PRD: In-Web WhatsApp Business Cloud API bridge, post-enrollment message gating, and `php artisan test:record` automated recording harness. |

---

### 1.2 Executive Summary & Strategic Mission
The **Computing Professional Enrichment & Development Division (CoPED)** within the School of Computing at **Universiti Utara Malaysia (UUM)** delivers high-impact upskilling, university-accredited micro-credentials, executive professional certifications, and industry masterclasses to external adult learners, enterprise cohorts, and international working professionals. 

While Universiti Utara Malaysia operates institutional academic platforms (such as UUM Online Learning powered by legacy Moodle), these platforms are engineered primarily for semester-long undergraduate curricula and suffer from extreme navigational clutter, steep authoring learning curves, high maintenance overhead, and an absence of external commercialization mechanisms. 

**CoPED PULSE** (*Professional Upskilling & Learning System for External Engagement*) solves this institutional bottleneck. CoPED PULSE is a custom-engineered, monolithic, server-driven Single-Page Application (SPA) designed to combine the **curriculum and grading governance of UUM Moodle** with the **distraction-free, media-first streaming theater of Open edX**. Built on a cutting-edge software stack—**Laravel 13 (PHP 8.4)**, **Inertia.js 3.5**, **React 19**, and **Tailwind CSS v4**—CoPED PULSE eliminates client-side routing complexity while providing instant component swaps and zero-lag reactivity.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   COPED PULSE CORE VALUE PILLARS                                 │
├────────────────────────────────┬─────────────────────────────────┬───────────────────────────────┤
│ 1. DISTRACTION-FREE THEATER    │ 2. COORDINATOR GOVERNANCE       │ 3. OMNICHANNEL MESSAGING      │
│ 3-Zone media theater with auto-│ Platform oversight with instant │ In-website WhatsApp Cloud API │
│ ticking progress telemetry and │ lecturer assignment/reassign-   │ bridge, sandbox simulation,   │
│ verifiable 1-page PDF certs.   │ ment across academic intakes.   │ and post-enrollment gating.   │
├────────────────────────────────┼─────────────────────────────────┼───────────────────────────────┤
│ 4. FLAT POSTER DESIGN SYSTEM   │ 5. HYBRID COMMERCIALIZATION     │ 6. AUTOMATED QA HARNESS       │
│ Strict Swiss design rules:     │ Dual billing: Free institutional│ End-to-end persona recording  │
│ 0 shadows, 0 gradients,        │ vs. Paid one-time RM commercial │ harness with microsecond-level│
│ 0 blurs, 0 em-dashes, 2px line.│ courses with live preview.      │ telemetry & negative testing. │
└────────────────────────────────┴─────────────────────────────────┴───────────────────────────────┘
```

---

## 2. Problem Statement & Strategic Objectives

### 2.1 Problem Statement Analysis
Comprehensive stakeholder interviews with CoPED leadership, School of Computing faculty members, and external corporate participants identified three systemic failure modes in the institutional delivery of continuing education:

1. **High Visual Clutter & Severe Authoring Overhead in Academic LMS Platforms:**
   Traditional Higher Education LMS deployments (e.g., standard Moodle or legacy CMS platforms) are bloated with hundreds of unused secondary plugins, multi-tiered nested settings trees, and heavy DOM elements. For short-course professional upskilling, university instructors spend hours configuring basic course containers instead of focusing on pedagogical content delivery. Page jumping between edit screens, material upload modules, and grading sheets causes severe operational friction.
2. **Adult Learner Frustration with Cluttered Media Players & Delayed Certification:**
   Adult professional learners operate under tight time constraints and require a friction-free, distraction-free environment. Existing academic platforms force students through disjointed pages, pop-up windows, and clunky video players lacking automated telemetry. Furthermore, completing a course often requires manual administrator intervention before certificates can be claimed, delaying credential sharing on LinkedIn or corporate HR verification portals.
3. **Absence of B2B Commercialization, Intake Governance & Secure Messaging:**
   Standard university LMS systems treat all courses as semester-based degree modules, lacking native commercial course pricing models (Free Institutional vs. Paid Commercial Course in Ringgit Malaysia `RM`). Crucially, they lack a dedicated **Subject Coordinator** tier capable of generating standardized course blueprints and reassigning different lecturers across intake sessions. Furthermore, external communications have historically relied on unmanaged external WhatsApp invite links (`chat.whatsapp.com`), exposing student phone numbers to unauthorized third parties and severing the learning audit trail.

---

### 2.2 Strategic Objectives & Key Performance Indicators
To systematically eliminate these constraints, CoPED PULSE commits to five strategic objectives:

- **SO-1: Streamlined 3-Step Course Blueprinting & Rapid Authoring:** Enable faculty to establish an intake-ready, fully themed professional course in under 90 seconds through a guided 3-Step Course Creation Wizard, coupled with a 5-Tab Unified Course Canvas that eliminates page jumping.
- **SO-2: Distraction-Free 3-Zone Learning Theater:** Deliver a media-first streaming player inspired by Open edX, combining video and document lessons with auto-ticking completion telemetry, inline student notes, and instant mastery validation.
- **SO-3: Agile Academic Governance & Commercialization Control:** Provide a dedicated Subject Coordinator governance tier with platform-wide oversight, enabling 1-click instructor reassignment and dynamic switching between free institutional training and commercial paid courses.
- **SO-4: Native In-Website WhatsApp Business Cloud API Communication:** Embed an integrated, split-pane WhatsApp-Web style communication hub directly within the application, backed by Meta WhatsApp Cloud API dispatch, Malaysian phone format integration (`+601...`), sandbox simulation, and post-enrollment message isolation.
- **SO-5: Automated Instant 1-Page PDF Credentialing:** Guarantee instantaneous issuance of a print-optimized, tamper-evident 1-page certificate upon passing the Final Assessment with 100% mastery, verified via an algorithmic hash `COPED-{enrollment_id}-{course_id}`.

---

### 2.3 Industry Benchmarking Matrix

| Evaluation Dimension | Legacy UUM Moodle (Standard) | Open edX (Enterprise/MOOC) | CoPED PULSE (v2.4.0) |
|---|---|---|---|
| **Core Architecture** | Multi-page PHP/HTML rendering; heavy DOM reloads; high database connection overhead. | Python/Django backend with micro-frontend (MFE) microservices; high devops footprint. | Monolithic server-driven SPA via Laravel 13, Inertia.js 3.5, and React 19. Single deployable container. |
| **UI Aesthetics & Design System** | Complex nested blocks, standard Bootstrap/CSS, inconsistent third-party plugins. | Modern responsive interface, but generic corporate appearance with multiple nested tabs. | Strict Flat Design Poster System: 0 shadows, 0 gradients, 0 blurs, 0 em-dashes, 2px borders, 6-color palette. |
| **Course Setup Complexity** | 20+ form fields on initial setup; manual section adding; steep learning curve (>15 min). | Complex Studio hierarchy (Section > Sub-section > Unit > Component); high author friction. | 3-Step Linear Creation Wizard with live preview, random theme color selector, and instant hub redirect (<90 sec). |
| **Instructor Course Workspace** | Fragmented pages: separate screens for Settings, Topics, Roster, and Grader Report. | Decoupled Studio (for editing) and LMS (for viewing); context-switching required. | Unified 5-Tab Moodle-Style Canvas: Curriculum, Settings, Participants, Grades, and Chat inside one persistent studio. |
| **Learner Media Player** | Cluttered sidebars, disjointed resource downloads, pop-up video windows. | 3-Zone structured player with media window and unit tabs at the top. | Video-first 3-Zone Theater: 16:9 stage, Guided 3-Action Bottom Bar, auto-ticking telemetry, and inline notes. |
| **External B2B Commercialization** | Complex external payment gateway plugins; difficult configuration for external learners. | Integrated ecommerce microservices requiring decoupled setup and external payment brokers. | Built-in 2-option model: Free Institutional vs. Paid Commercial Course (`billing_type = 'one_time'`, custom RM price). |
| **Governance & Lecturer Assignment** | Manual role assignment via deep administrative settings; high risk of misconfiguration. | Organization-based course teams; no lightweight intake-based reassignment. | Dedicated `coordinator` role: platform-wide course oversight and 1-click reassignment via Modal and Participants tab. |
| **Student Communication** | Asynchronous Moodle Forums or unmonitored external WhatsApp group redirects. | Discussion forums and third-party integrations; no native WhatsApp Cloud API bridge. | 100% In-Website WhatsApp Cloud API bridge; group & 1-on-1 direct chat; sandbox simulator; post-enrollment gate. |
| **Certification Engine** | Multi-page PDF generation via third-party plugins; requires background cron setup. | Badge and certificate generation requiring external certificate workers. | Instant client/server 1-page print-optimized certificate with unique verification hash `COPED-{enrollment_id}-{course_id}`. |
| **Mobile Responsiveness** | Mediocre mobile browser rendering; depends on third-party mobile apps. | Responsive web UI; distinct native apps. | Mobile-first PWA responsive web UI: sticky bottom navigation, video-first order, and single-pane mobile chat. |
| **Test Coverage & Telemetry** | Standard unit tests; minimal automated journey telemetry. | Extensive backend pytest and Selenium integration tests; heavy infrastructure. | Built-in `php artisan test:record` harness: 5 persona suites, microsecond execution tracking, and security gate audits. |

---

## 3. User Personas & RBAC Permission Matrix

### 3.1 Persona Profiles & User Journeys

#### Persona 1: Guest (Unauthenticated External Visitor)
- **Profile:** External IT professional, corporate HR manager, or prospective student exploring upskilling opportunities.
- **Needs:** Friction-free discovery of upcoming professional courses, clear pricing in RM, verified curriculum outlines, and instant self-service account registration.
- **Primary Journey:** Browses `/` (Landing Page) $\rightarrow$ Reviews catalog highlights $\rightarrow$ Clicks `Register` $\rightarrow$ Submits name, email, Malaysian phone number, and password $\rightarrow$ Authenticated session established $\rightarrow$ System automatically redirects to `/portal`.

#### Persona 2: Subject Coordinator (`role = 'coordinator'`)
- **Profile:** CoPED Division Director, Head of Computing Enrichment, or Lead Academic Program Manager.
- **Needs:** Global platform oversight across all courses, quality control of curricula, assignment and reassignment of faculty lecturers across academic intakes, and commercial fee governance.
- **Primary Journey:** Logs in at `/login` $\rightarrow$ Redirected to `/dashboard` with amber `SUBJECT COORDINATOR` badge $\rightarrow$ Accesses high-density Courses Table at `/staff/courses` with platform-wide visibility $\rightarrow$ Uses Coordinator Instructor Filter to audit faculty workloads $\rightarrow$ Launches 3-Step Wizard to create course blueprints $\rightarrow$ Assigns an instructor $\rightarrow$ Inspects student grades and telemetry across cohorts.

#### Persona 3: Instructor / Lecturer (`role = 'staff'`)
- **Profile:** Academic faculty member or certified industry practitioner appointed to instruct an upskilling cohort.
- **Needs:** Rapid curriculum authoring, streamlined video/slide uploads, quiz and final assessment authoring, real-time learner monitoring, and responsive communication without revealing personal WhatsApp contacts.
- **Primary Journey:** Logs in at `/login` $\rightarrow$ Lands on `/dashboard` viewing assigned courses and the "Needs Attention" feed $\rightarrow$ Enters `/staff/courses/{id}/edit` $\rightarrow$ Uses `Edit Mode` toggle to author modules, subtopics, and quizzes $\rightarrow$ Monitors cohort progress in `Participants` and `Grades` tabs $\rightarrow$ Engages learners via `Student Chat` with instant WhatsApp delivery.

#### Persona 4: Learner / External Professional (`role = 'learner'`)
- **Profile:** Working software engineer, project manager, or civil servant seeking verifiable micro-credentials (e.g., PMI-CAPM®, Python for Data Analytics).
- **Needs:** Distraction-free video playback, persistent study notes, transparent progress tracking against daily study goals, direct access to the instructor, and an instant 1-page printable credential.
- **Primary Journey:** Logs in at `/login` $\rightarrow$ Lands on `/portal` $\rightarrow$ Clicks `Resume Learning` on active course banner $\rightarrow$ Navigates through 3-Zone Theater at `/learner/courses/{id}/learn` $\rightarrow$ Marks modules complete via Unified 3-Action Bottom Bar $\rightarrow$ Passes Final Assessment with 100% $\rightarrow$ Unlocks and prints official certificate at `/learner/courses/{id}/certificate`.

---

### 3.2 Role-Based Access Control (RBAC) Permission Matrix

| Functional Capability | Guest | Learner (`learner`) | Instructor (`staff`) | Subject Coordinator (`coordinator`) | Policy / Enforcement Mechanism |
|---|:---:|:---:|:---:|:---:|---|
| **View Landing Page & Public Information** | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` | Public Route (`/`) |
| **Register & Authenticate Account** | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` | `redirect.auth` Middleware |
| **Access Learner Portal (`/portal`)** | `DENY` | `ALLOW` | `DENY` (403) | `DENY` (403) | `role:learner` Middleware |
| **Browse Course Catalog (`/learner/catalog`)**| `DENY` | `ALLOW` | `DENY` (403) | `DENY` (403) | `role:learner` Middleware |
| **Enroll in Free / Paid Courses** | `DENY` | `ALLOW` | `DENY` (403) | `DENY` (403) | `role:learner` Middleware |
| **Access 3-Zone Theater Player (`/learn`)** | `DENY` | `ALLOW` (Enrolled) | `DENY` (403) | `DENY` (403) | Enrollment Record Verification |
| **Submit Module Notes & Feedback** | `DENY` | `ALLOW` | `DENY` | `DENY` | Scoped to `auth()->id()` |
| **Take Quizzes & Final Assessment** | `DENY` | `ALLOW` (Enrolled) | `DENY` | `DENY` | Assessment Engine Gate |
| **View & Print Official Certificate** | `DENY` | `ALLOW` (100% Pass) | `DENY` | `DENY` | 100% Mastery Gate Check |
| **Access Staff Dashboard (`/dashboard`)** | `DENY` | `DENY` (403) | `ALLOW` | `ALLOW` | `role:staff` Middleware |
| **Access Course Studio (`/staff/courses`)** | `DENY` | `DENY` (403) | `ALLOW` (Assigned) | `ALLOW` (All) | `CoursePolicy@viewAny`, `@view` |
| **Create New Subject Blueprint** | `DENY` | `DENY` (403) | `ALLOW` | `ALLOW` | `CoursePolicy@create` |
| **Assign / Reassign Subject Instructor** | `DENY` | `DENY` (403) | `DENY` (403) | `ALLOW` | `isCoordinator()` Inspection Gate |
| **Edit Curriculum, Modules & Lessons** | `DENY` | `DENY` (403) | `ALLOW` (Assigned) | `ALLOW` (All) | `CoursePolicy@update` |
| **Deploy Course to Live Status (`published`)**| `DENY` | `DENY` (403) | `ALLOW` (Assigned) | `ALLOW` (All) | `CoursePolicy@update` |
| **Delete Course Container** | `DENY` | `DENY` (403) | `ALLOW` (Assigned) | `ALLOW` (All) | `CoursePolicy@delete` |
| **Inspect Learner Telemetry & Grader Report**| `DENY` | `DENY` (403) | `ALLOW` (Assigned) | `ALLOW` (All) | `CoursePolicy@view` |
| **Post Messages in Course Chat** | `DENY` | `ALLOW` (Enrolled) | `ALLOW` (Assigned) | `ALLOW` (All) | `authorizeCourseAccess()` |
| **View Historical Chat Messages** | `DENY` | `ALLOW` (Post-Enrolled)| `ALLOW` (All) | `ALLOW` (All) | Post-Enrollment Date Filter |
| **Simulate WhatsApp Inbound Reply** | `DENY` | `ALLOW` (Local API) | `ALLOW` (Local API) | `ALLOW` (Local API) | Sandbox Dispatch Guard |

---

## 4. Functional Requirements — Subject Coordinator & Instructor Studio

- **FR-01: 3-Step Course Creation Wizard (`Staff/Courses/Create.jsx`):** Linear progression with Step 1 (Course Identity, title, academic year, auto-random theme color, instructor dropdown), Step 2 (Subscription Model: Free vs. Paid with live catalog preview), and Step 3 (Industry Certification & Summary).
- **FR-02: 6-Color Flat Theme System & Auto-Random Default:** Curated palette (`blue`, `emerald`, `amber`, `navy`, `rose`, `charcoal`) with `CourseLogoBadge.jsx`, `[ 🎲 Random Color ]` button, and auto-random selection on initial mount.
- **FR-03: Simplified 2-Option Subscription Model:** Free Institutional (`RM 0.00`) vs. Paid Commercial Course (`billing_type = 'one_time'`, custom price in `RM`).
- **FR-04: External Industry Credential Affiliation:** Captures external certification titles and URLs (e.g., PMI-CAPM®, JLM) and renders an action card on the certificate view.
- **FR-05: Coordinator Subject Instructor Assignment & Reassignment:** Dedicated capability for Subject Coordinators via `POST /staff/courses/{course}/assign-instructor` through Course Index modal and Participants tab.
- **FR-06: Instructor KPI Dashboard:** 4 flat stat cards (`Total Courses`, `Total Enrolled Learners`, `Completions`, `Overall Progress Rate`).
- **FR-07: High-Density Courses Management Table:** Search, filter pills (`All`, `Live`, `Drafts`), sortable headers, and Coordinator Lecturer Filter.
- **FR-08: Full-Card Clickability & Square-Tile Navigation:** Direct studio navigation on click with `e.stopPropagation()` for secondary actions.
- **FR-09: Flat Delete Confirmation Modal:** Inline modal naming the specific course title (zero browser `window.confirm`).
- **FR-10: "Needs Attention" Learner Feed:** Deduplicated student feed with filter pills (`All`, `Pending quizzes`, `Completed`).
- **FR-11: Unified 5-Tab Moodle-Style Course Canvas (`Staff/Courses/Edit.jsx`):** Single workspace with `Edit Mode` toggle switch and 5 horizontal tabs: `Course`, `Settings`, `Participants`, `Grades`, `💬 Student Chat`.
- **FR-12: Collapsible Course Index Tree & Deep Activity Modal:** Left tree (`lg:col-span-3`) and right cards (`lg:col-span-9`) with 4-tile activity modal (`Video`, `Slide`, `Practice Quiz`, `Final Exam`).
- **FR-13: Inline Quick-Rename for Modules:** Instant inline renaming without losing metadata.
- **FR-14: Participants Tab with Lecturer Card & Student Roster:** Lecturer card with `[ Reassign Lecturer ]` action, search, `All | A-Z` pills, progress bars, relative timestamps, and direct chat buttons.
- **FR-15: Grader Report Matrix:** Tabular report with pinned learner name/email columns, dynamic module columns, final assessment status, and cohort averages.

---

## 5. Functional Requirements — Learner Experience & Certification Engine

- **FR-16: Course Catalog & Enrollment Gate (`Catalog.jsx`):** Course browsing with instant enrollment for free courses and summary checkout for paid courses.
- **FR-17: Learner Portal & Study Goal Tracker (`Portal.jsx`):** "Continue Where You Left Off" top banner and daily study goal tracker.
- **FR-18: 3-Zone Learning Theater — Zone 1 Media Stage (`Learn.jsx`):** 16:9 responsive video/document player with auto-ticking completion telemetry.
- **FR-19: Guided 3-Action Bottom Control Bar:** `[ ← Previous Unit ]` | `[ ✓ Mark Module as Complete ]` | `[ Next Module → ]` (or `[ 🎯 Take Final Assessment → ]`).
- **FR-20: 3-Zone Learning Theater — Zone 2 Curriculum Navigator:** Collapsible module tree with green checkmarks and locked/unlocked certificate link.
- **FR-21: 3-Zone Learning Theater — Zone 3 Practice Quizzes & Interactive Notes:** Inline practice checks, persistent notes scratchpad, module feedback ratings, and instructor chat.
- **FR-22: Mandatory Final Course Assessment (100% Mastery Threshold):** 100% score required to trigger completion and unlock certification.
- **FR-23: Automated Progress Telemetry & Real-Time Calculation Engine:** Real-time percentage calculation based on completed modules and final exam status.
- **FR-24: Verifiable 1-Page Printable Certificate (`Certificate.jsx`):** Single-page print-optimized landscape document with unique verification ID `COPED-{enrollment_id}-{course_id}`.
- **FR-25: Industry Certification External Pathway Card:** Affiliation link to external credentials rendered cleanly on certificate page.

---

## 6. Functional Requirements — In-Web WhatsApp Cloud API Chat & Notification System

- **FR-26: In-Website Split-Pane WhatsApp-Web Style Chat Interface:** Course Announcement Group and 1-on-1 private messaging without external app redirects.
- **FR-27: Meta WhatsApp Business Cloud API Dispatch & Sandbox Simulation:** Cloud API dispatch to Malaysian phone numbers (`+601...`) and local sandbox simulator with `[ ⚡ Simulate WhatsApp Reply ]`.
- **FR-28: Post-Enrollment Chat Privacy Gate:** Scoped Eloquent query ensuring learners only view group chat messages sent on or after their enrollment timestamp (`created_at >= enrollments.created_at`).
- **FR-29: 1-on-1 Direct Messaging Isolation:** Strict privacy between individual students and instructors.
- **FR-30: Global Navbar Notification Bell (`ChatNotificationBell.jsx`):** Real-time unread badge counter, unread dropdown list, and silent `mark-read` upon opening chat.
- **FR-31: Dismissible Floating Flat Toast Notification Banner:** Real-time bottom-right toast with direct link to open course chat.
- **FR-32: Course WhatsApp Group Link Management:** Optional external community group link management.

---

## 7. UI/UX Design System & Mobile Web Specifications

### 7.1 The Flat Design Poster System (4 Non-Negotiable Rules)
1. **Zero Shadows:** No `shadow-*` classes anywhere. Depth created strictly via 2px borders (`border-2 border-[#E5E7EB]` and `border-2 border-[#111827]`).
2. **Zero Gradients:** No `bg-gradient-*`. Solid colors and high-contrast flat pills only.
3. **Zero Blurs:** No `backdrop-blur*`. Opaque crisp surfaces only.
4. **Zero Em-Dashes:** Never use `—` in UI copy. Use middle dots (`·`) or hyphens (`-`).
5. **Single Solid Button Rule:** At most one solid primary CTA per card/row; companion actions use outline or quiet styles.

### 7.2 Typography & Master Color Tokens
- Headings: `Outfit` (`font-display`, extrabold). Body: `Instrument Sans` (`font-sans`). IDs: `ui-monospace`.
- Tokens: Primary Blue `#3B82F6`, Secondary Emerald `#10B981`, Accent Amber `#F59E0B`, Classic Ink `#111827`, Muted Neutral `#F3F4F6`, Border Line `#E5E7EB`.

### 7.3 Curated 6-Color Flat Theme System
- `blue` (`#3B82F6`), `emerald` (`#10B981`), `amber` (`#F59E0B`), `navy` (`#1E3A8A`), `rose` (`#E11D48`), `charcoal` (`#111827`).

### 7.4 Mobile Web & PWA Specifications (360px–430px)
- Web App Manifest (`public/manifest.json`) & mobile viewport meta tags.
- Sticky Mobile Bottom Navigation Bar (`md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t-2 border-[#111827]`):
  - Staff: `📊 Dashboard` | `📁 Courses` | `➕ New Course`
  - Learner: `🏠 My Portal` | `📚 Catalog` | `💬 Alerts`
- Video-First Mobile Theater: 16:9 Video Stage renders at the top of mobile screens (`order-1 lg:order-2`) above a collapsible Curriculum accordion.
- Single-Pane Mobile Chat: Toggles smoothly between Conversation List and Active Thread with `[ ← All Conversations ]` back button.

---

## 8. System Architecture & Database Schema

### 8.1 Monolithic Single-Page Application (SPA) Architecture
Laravel 13 handles business logic, security, and persistence; Inertia.js 3.5 bridges page responses directly into React 19 components without client-side routing.

### 8.2 Entity-Relationship Structure
- `users`: `id`, `name`, `email`, `phone`, `password`, `role ('coordinator' | 'staff' | 'learner')`, `organization_id`, `daily_goal_items`.
- `courses`: `id`, `instructor_id`, `organization_id`, `title`, `description`, `status ('draft' | 'published' | 'archived')`, `academic_year`, `category_logo`, `billing_type ('free' | 'one_time')`, `price`, `cert_title`, `cert_url`, `whatsapp_group_url`.
- `modules`: `id`, `course_id`, `title`, `description`, `content_type`, `media_url`, `order`.
- `lessons`: `id`, `module_id`, `title`, `content_type ('video' | 'pdf' | 'text')`, `content_url`, `content`, `order`, `duration`.
- `assessments`: `id`, `course_id`, `module_id (nullable)`, `question`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`.
- `enrollments`: `id`, `user_id`, `course_id`, `progress`, `enrolled_at`, `completed_at`.
- `module_completions`: `id`, `user_id`, `course_id`, `module_id`, `completed_at`.
- `course_messages`: `id`, `course_id`, `sender_id`, `recipient_id (nullable)`, `body`, `read_at`.
- `notes`: `id`, `user_id`, `course_id`, `module_id`, `content`.

---

## 9. API & Inertia Route Specification Table

| HTTP Method | URI Pattern | Controller Action | Role & Middleware Access | Purpose & Response Schema |
|---|---|---|---|---|
| `GET` | `/` | Closure | `guest`, `auth` | Landing Page. Redirects authenticated users. Returns `design_v1/Welcome`. |
| `GET` | `/register` | `Auth\RegisteredUserController@create` | `redirect.auth` | Renders user registration page (`design_v1/Auth/Register`). |
| `POST` | `/register` | `Auth\RegisteredUserController@store` | `redirect.auth` | Validates registration data, creates learner account, logs in. |
| `GET` | `/login` | `Auth\AuthenticatedSessionController@create` | `redirect.auth` | Renders authentication page (`design_v1/Auth/Login`). |
| `POST` | `/login` | `Auth\AuthenticatedSessionController@store` | `redirect.auth` | Authenticates credentials, regenerates session ID. |
| `POST` | `/logout` | `Auth\AuthenticatedSessionController@destroy`| `auth` | Invalidates session, regenerates CSRF token. |
| `GET` | `/dashboard` | `Staff\DashboardController` | `role:staff` | Staff & Coordinator KPI dashboard (`design_v1/Staff/Dashboard`). |
| `GET` | `/portal` | Closure | `role:learner` | Learner Portal, active enrollments, and goal metrics (`design_v1/Learner/Portal`). |
| `GET` | `/learner/catalog` | `Learner\CatalogController@index` | `role:learner` | Browsable course catalog with category filters (`design_v1/Learner/Catalog`). |
| `POST` | `/learner/catalog/{course}/enroll` | `Learner\CatalogController@enroll` | `role:learner` | Enrolls student into target course. Creates idempotent `enrollments` record. |
| `GET` | `/learner/courses/{course}/learn` | Closure | `role:learner` | 3-Zone Learning Theater (`design_v1/Learner/Course/Learn`). Enforces enrollment check. |
| `GET` | `/learner/courses/{course}/certificate`| `Learner\CertificateController@show`| `role:learner` | Official 1-page printable certificate. Enforces 100% completion lock gate. |
| `POST` | `/learner/courses/{course}/assess` | `Learner\AssessmentController@assess`| `role:learner` | Evaluates Final Assessment submission; calculates score; marks completion if 100%. |
| `POST` | `/learner/courses/{course}/modules/{module}/complete` | `Learner\ModuleCompletionController@store` | `role:learner` | Marks a module complete. Increments cohort progress percentage. |
| `DELETE` | `/learner/courses/{course}/modules/{module}/complete` | `Learner\ModuleCompletionController@destroy`| `role:learner` | Reverts module completion status; recalculates progress percentage. |
| `POST` | `/learner/courses/{course}/modules/{module}/notes` | `Learner\NoteController@store` | `role:learner` | Persists or updates learner study scratchpad notes. |
| `PUT` | `/learner/goal` | `Learner\GoalController@update` | `role:learner` | Updates user's daily study items target (`users.daily_goal_items`). |
| `GET` | `/staff/courses` | `Staff\CourseController@index` | `role:staff` | High-density management table (`design_v1/Staff/Courses/Index`). |
| `GET` | `/staff/courses/create` | `Staff\CourseController@create` | `role:staff` | 3-Step Course Creation Wizard (`design_v1/Staff/Courses/Create`). |
| `POST` | `/staff/courses` | `Staff\CourseController@store` | `role:staff` | Persists new course blueprint; associates instructor and theme color. |
| `GET` | `/staff/courses/{course}/edit` | `Staff\CourseController@edit` | `role:staff` | Unified 5-Tab Course Studio Canvas (`design_v1/Staff/Courses/Edit`). |
| `PUT` | `/staff/courses/{course}` | `Staff\CourseController@update` | `role:staff` | Updates course settings, subscription pricing, and certification affiliations. |
| `POST` | `/staff/courses/{course}/deploy` | `Staff\CourseController@deploy` | `role:staff` | Transitions course status to `published`, making it live in the catalog. |
| `POST` | `/staff/courses/{course}/assign-instructor`| `Staff\CourseController@assignInstructor` | `role:staff` (Coordinator Gate)| Reassigns subject lecturer. Blocked for standard staff (HTTP 403). |
| `DELETE` | `/staff/courses/{course}` | `Staff\CourseController@destroy` | `role:staff` | Deletes course container and cascades child records. |
| `POST` | `/staff/courses/{course}/modules` | `Staff\ModuleController@store` | `role:staff` | Adds a new module chapter; calculates sequence order automatically. |
| `PUT` | `/staff/courses/{course}/modules/{module}` | `Staff\ModuleController@update` | `role:staff` | Updates module details or executes inline quick-rename. |
| `DELETE` | `/staff/courses/{course}/modules/{module}` | `Staff\ModuleController@destroy` | `role:staff` | Removes module and re-indexes remaining sequence order. |
| `GET` | `/courses/{course}/chat/messages` | `CourseChatController@index` | `auth` (Enrolled/Staff) | Retrieves chat messages. Applies post-enrollment date gate for learners. |
| `POST` | `/courses/{course}/chat/messages` | `CourseChatController@store` | `auth` (Enrolled/Staff) | Dispatches message; triggers WhatsApp Cloud API (or local sandbox simulation). |
| `POST` | `/courses/{course}/chat/mark-read` | `CourseChatController@markRead` | `auth` (Enrolled/Staff) | Marks all unread messages as read; clears notification badges. |
| `POST` | `/courses/{course}/chat/whatsapp-simulate`| `CourseChatController@simulateWhatsapp`| `auth` (Enrolled/Staff) | Injects simulated incoming WhatsApp reply (`[WhatsApp] ...`). |
| `POST` | `/courses/{course}/whatsapp-link` | `CourseChatController@updateWhatsappLink`| `role:staff` | Updates auxiliary external WhatsApp community group URL. |

---

## 10. Non-Functional Requirements (NFRs)
- **NFR-P1 (Performance):** Inertia view swaps $\le$ 150ms; page load $\le$ 1.2s; assets $\le$ 850 KB; DB queries $\le$ 25ms.
- **NFR-S1 (Security):** CSRF verification, SQL injection protection via Eloquent PDO, XSS input sanitization.
- **NFR-S2 (Negative Role Gates):** Strict HTTP 403 Forbidden on role violations and cross-course tampering.
- **NFR-D1 (Data Privacy & Isolation):** Post-enrollment chat gating and 1-on-1 private messaging isolation.
- **NFR-R1 (Reliability & Fault Tolerance):** Graceful degradation to WhatsApp sandbox mode when credentials absent; atomic DB transactions.

---

## 11. Automated Testing, QA & Execution Recording Harness
- **Command:** `php artisan test:record`
- **Mechanism:** Powered by `FunctionCallRecorder` and `RecordsFunctionCalls`, storing cross-process execution traces in `storage/app/raw_steps.jsonl`.
- **Outputs:** `TEST_FUNCTION_RECORD.md` and `execution_log.json`.
- **5 End-to-End Persona Journey Suites:**
  1. `GuestJourneyTest`: Landing discovery, catalog, self-registration.
  2. `LearnerJourneyTest`: Catalog browsing, enrollment, 3-Zone Theater, 100% assessment pass, 1-page certificate.
  3. `InstructorJourneyTest`: Wizard creation, 5-tab canvas, module quick rename, grader report audit.
  4. `CoordinatorJourneyTest`: Platform-wide catalog oversight, lecturer filtering, 1-click reassignment.
  5. `CourseChatJourneyTest`: In-app group & 1-on-1 chat, WhatsApp API dispatch, incoming reply simulation.
- **Negative Security Guardrails:** 403 role gates, certificate lock gates, post-enrollment chat privacy gates.

---

## 12. Release Roadmap & Success Metrics (KPIs)
- **Roadmap:**
  - Phase 1: Monolithic SPA Core, 3-Zone Theater, Flat Design System, 1-Page Cert Engine.
  - Phase 2: In-Web WhatsApp Cloud API, Coordinator RBAC, Post-Enrollment Gate, 5-Tab Studio Canvas.
  - Phase 3: Mobile Web & PWA Manifest, Sticky Bottom Navigation, Grader Matrix Performance.
  - Phase 4: Enterprise Commercialization, B2B Corporate Billing, Multi-Organization Tenancy.
- **KPIs:**
  - Curriculum Deployment Time: $\le$ 90 seconds
  - Learner Course Completion Rate: $\ge$ 78.5%
  - Chat Response Turnaround: $\le$ 45 minutes
  - Certificate Verification Lookup: $\le$ 200ms
  - Mobile Web Engagement: $\ge$ 45.0%
  - System Uptime: $\ge$ 99.95%
  - Test Quality Coverage: 100% Passing (118+ feature tests)

==================================================================================================
                                END OF PRODUCT REQUIREMENTS DOCUMENT
==================================================================================================
