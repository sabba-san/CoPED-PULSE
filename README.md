# CoPED PULSE

A lightweight **Learning Management System (LMS)** where instructors build and publish courses, and learners browse a catalog, enroll, and work through course content module by module.

The sample data is themed around child protection training (e.g. *Child Protection Fundamentals*, *Psychosocial Support for Children*), but the platform itself is general-purpose.

> **Status:** MVP, in active development.

## Features

### For learners
- **Course catalog:** browse all published courses with title, instructor and description.
- **One-click enrollment:** enroll from the catalog; duplicate enrollments are prevented.
- **Learner portal:** see your enrolled courses with an *In progress* or *Completed* status.
- **Course view:** every module is shown with a title, description and a **View Media** link that opens in a new tab.

### For instructors (staff)
- **Dashboard** and full **course management** (create, view, edit, delete) for their own courses.
- Course lifecycle: `draft`, `published` or `archived`. Only published courses appear in the catalog.
- **Module & media system:** add and delete modules per course, each with a title, description and an optional media URL (e.g. a YouTube link). Modules are ordered automatically. The backend also has an update endpoint; an edit form is not in the UI yet.

### Platform
- **Role-based access** (`staff` vs `learner`) enforced by middleware, so each role only reaches its own pages.
- Redesigned login and registration screens.
- Media links are validated server-side (`url`) and client-side (only `http`/`https` are rendered as links).

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Laravel 13, PHP 8.3+ |
| Frontend | React 19 with Inertia.js 3 (server-driven SPA, no separate API) |
| Styling | Tailwind CSS 4 |
| Build | Vite 8 |
| Database | SQLite by default (any Laravel-supported DB works) |

## Project structure

```
coped-pulse/
├── app/
│   ├── Http/Controllers/
│   │   ├── Auth/        # Login, registration
│   │   ├── Learner/     # CatalogController (catalog + enroll)
│   │   └── Staff/       # CourseController, ModuleController
│   ├── Http/Middleware/ # RoleMiddleware, RedirectIfAuthenticated
│   └── Models/          # User, Course, Module, Lesson, Enrollment
├── database/            # migrations + seeders
├── resources/js/
│   ├── Layouts/design_v1/   # LearnerLayout, StaffLayout
│   └── Pages/design_v1/     # Auth, Learner, Staff pages (current UI)
└── routes/web.php
```

The current UI lives in `design_v1/` folders. The older pages are kept alongside it, untouched, and are no longer routed to.

### Data model

```
User (role: staff | learner)
 ├── has many Courses     (as instructor)
 └── has many Enrollments (progress, enrolled_at, completed_at)

Course (draft | published | archived)
 ├── belongs to User      (instructor)
 ├── has many Modules     (ordered)
 └── has many Enrollments

Module (title, description, media_url, order)
 └── has many Lessons     (video | pdf | text)
```

## Getting started

**Requirements:** PHP 8.3+, Composer, Node.js and npm.

```bash
git clone https://github.com/sabba-san/CoPED-PULSE.git
cd CoPED-PULSE/coped-pulse

composer install
cp .env.example .env
php artisan key:generate

touch database/database.sqlite      # SQLite is the default database
php artisan migrate --seed

npm install
npm run dev                         # terminal 1: Vite
php artisan serve                   # terminal 2: http://localhost:8000
```

For a production build, run `npm run build`.

### Demo accounts (local development only)

`php artisan migrate --seed` creates these accounts. All use the password `password`.

| Role | Email |
|---|---|
| Instructor (staff) | `instructor@coped.org` |
| Learner | `learner@coped.org` |

> [!WARNING]
> These are seeded demo credentials. Never seed them into a public or production environment.

## Routes at a glance

| Access | Route | Purpose |
|---|---|---|
| Guest | `/login`, `/register` | Authentication |
| Learner | `/portal` | Enrolled courses |
| Learner | `/learner/catalog` | Browse published courses |
| Learner | `POST /learner/catalog/{course}/enroll` | Enroll |
| Learner | `/learner/courses/{course}/learn` | View a course and its modules |
| Staff | `/dashboard` | Instructor dashboard |
| Staff | `/staff/courses` (resource) | Manage courses |
| Staff | `/staff/courses/{course}/modules` | Create, update and delete modules |

## Testing

```bash
php artisan test
```

> Automated test coverage is currently minimal (only the default Laravel example tests).

## Roadmap / known gaps

- Authorization policy checks on `ModuleController` (module changes should be limited to the course owner).
- Lessons are modelled in the database but not yet exposed in the UI.
- Progress tracking and course completion for learners.
- Feature tests for enrollment, role access and the module system.
- Embedded video playback (currently a plain link to the media URL).

## License

No license has been specified yet.
