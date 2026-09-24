# StudyHub — Student Notes & Learning Resources Finder

[![Stack](https://img.shields.io/badge/Stack-React_|_Node.js_|_Express_|_Supabase-indigo.svg)](#technology-stack)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)](#database-setup)
[![Auth](https://img.shields.io/badge/Auth-Supabase_JWT-emerald.svg)](#authentication-workflow)
[![Security](https://img.shields.io/badge/Security-Helmet_|_RateLimit_|_MagicBytes-rose.svg)](#security-features)

**StudyHub** is a production-ready, full-stack academic web platform designed to streamline how university students discover, share, review, and bookmark syllabus-aligned notes, lecture handouts, and exam question banks. 

Resources are organized using a strict academic hierarchy:
$$\text{Department} \longrightarrow \text{Semester} \longrightarrow \text{Course Subject} \longrightarrow \text{Syllabus Unit} \longrightarrow \text{Resources}$$

---

## 1. Features

### For Students
- **Smart Resource Finder**: Search notes and question banks by keyword, department, semester (1–8), subject, unit, and resource type (e.g. PDF Notes, Cheat Sheet, 2-Mark & 16-Mark Q&A, Lab Manual).
- **Personalized Dashboard**: View recommended materials tailored to your department and semester, popular downloads, and recently added materials.
- **In-Browser PDF Viewer & Direct Downloads**: Preview PDF handouts right in the browser or download with live download metric counters.
- **Bookmarks & Saved Notes**: Save formulas, cheat sheets, and question banks for fast revision before exams.
- **Peer Ratings & Reviews**: Rate resources from 1 to 5 stars and post helpful feedback for your classmates.
- **Resource Contribution**: Upload academic notes with automatic format validation and track approval status (`pending`, `approved`, `rejected` with reviewer reason).
- **Report Inappropriate Content**: Report broken files, copyright violations, or inaccurate answers for moderation review.

### For Staff & Moderators
- **Pending Review Queue**: Inspect incoming student uploads and approve or reject submissions with custom feedback.
- **Report Triage**: Review flagged materials, resolve concerns, or remove violating documents.

### For Administrators
- **Platform Analytics**: Track total active students, published resources, downloads, and popular subjects.
- **User Role Management**: Search user profiles and promote/demote roles (`student`, `moderator`, `admin`).
- **Curriculum Taxonomy Management**: Full CRUD operations for Departments, Course Subjects, and Syllabus Units.
- **Master Catalog Management**: Search, filter, review, or permanently purge any resource across the platform.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js, Multer (Memory Storage), Morgan |
| **Database** | Supabase PostgreSQL (Triggers, Foreign Keys, Indexes, Full-Text Search) |
| **Authentication** | Supabase Auth (JWT Bearer Token verification on backend) |
| **File Storage** | Supabase Storage (`resources` bucket with structured pathing) |
| **Security** | Helmet, CORS, Express-Rate-Limit, Zod validation, PDF magic bytes inspection |
| **Testing** | Jest, Supertest |

---

## 3. Architecture Overview

```text
                             STUDENT / ADMIN
                                   |
                                   v
                     +---------------------------+
                     |  React (Vite) + Tailwind  |
                     |  Frontend (Port 5173)     |
                     +-------------+-------------+
                                   |
                       HTTPS REST API (Bearer JWT)
                                   |
                                   v
                     +---------------------------+
                     |    Node.js + Express      |
                     |    Backend API (Port 5000)|
                     +-------------+-------------+
                                   |
             +---------------------+---------------------+
             |                                           |
             v                                           v
+--------------------------+               +--------------------------+
|   Supabase PostgreSQL   |               |     Supabase Storage     |
|   - Profiles & Roles     |               |     - Bucket: resources  |
|   - Depts, Subjects,     |               |     - Structured Paths:  |
|     Units, Resources     |               |       resources/{dept}/  |
|   - Bookmarks, Ratings,  |               |       {sem}/{subj}/      |
|     Reports, Tags        |               |       {uuid}.pdf         |
|   - RLS Policies         |               +--------------------------+
+--------------------------+
```

---

## 4. Directory Structure

```text
student-note/
├── backend/
│   ├── src/
│   │   ├── config/          # Supabase client & environment configuration
│   │   ├── controllers/     # Route business controllers
│   │   ├── middleware/      # Auth, RBAC, Multer upload, Rate limiting, Validation
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Storage, Search & Resource domain services
│   │   ├── validators/      # Zod validation schemas
│   │   ├── app.js           # Express app assembly & security middleware
│   │   └── server.js        # Server listener
│   ├── tests/               # Jest & Supertest automated test suite
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, ResourceCard, FilterPanel, SearchBar, Modal...
│   │   ├── context/         # AuthContext & ToastContext
│   │   ├── hooks/           # useAuth, useResources
│   │   ├── pages/           # Public, Student & Administrative views
│   │   ├── services/        # Axios API client & Supabase frontend client
│   │   ├── utils/           # Formatters & Validators
│   │   ├── App.jsx          # Route hierarchy with RBAC guards
│   │   └── main.jsx
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── supabase/
│   ├── schema.sql           # Tables, constraints, foreign keys, triggers, full-text search
│   ├── rls.sql              # Row Level Security (RLS) & Storage bucket policies
│   └── seed.sql             # Sample departments, subjects, units, resources, and tags
│
├── .gitignore
└── README.md
```

---

## 5. Database Schema & Tables

The system uses standard PostgreSQL relational integrity:

1. **`departments`**: `id`, `name`, `code` (UNIQUE), `description`, `created_at`
2. **`profiles`**: `id` (references `auth.users(id)`), `full_name`, `email`, `college`, `department_id`, `semester`, `role` (`student` \| `moderator` \| `admin`), `avatar_url`, `created_at`, `updated_at`
3. **`subjects`**: `id`, `department_id`, `semester` (1–8), `name`, `code`, `description`, `created_at`, `updated_at`
4. **`units`**: `id`, `subject_id`, `unit_number`, `title`, `description`, `created_at`
5. **`resources`**: `id`, `title`, `description`, `subject_id`, `unit_id`, `uploaded_by`, `resource_type`, `file_name`, `file_path`, `file_size`, `mime_type`, `external_url`, `status` (`pending` \| `approved` \| `rejected`), `rejection_reason`, `views`, `downloads`, `created_at`, `updated_at`
6. **`bookmarks`**: `id`, `user_id`, `resource_id`, `created_at` (UNIQUE constraint on `user_id + resource_id`)
7. **`ratings`**: `id`, `user_id`, `resource_id`, `rating` (1–5), `review`, `created_at`, `updated_at` (UNIQUE constraint on `user_id + resource_id`)
8. **`reports`**: `id`, `resource_id`, `reported_by`, `reason`, `description`, `status` (`pending` \| `reviewed` \| `resolved` \| `dismissed`), `created_at`, `resolved_at`
9. **`tags` & `resource_tags`**: Keyword indexing for full-text search.

---

## 6. Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Exposure |
|---|---|---|
| `PORT` | Local server port (Default: `5000`) | Private |
| `NODE_ENV` | Environment (`development` or `production`) | Private |
| `SUPABASE_URL` | Supabase project URL (`https://xyz.supabase.co`) | Private |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (**DO NOT EXPOSE TO CLIENT**) | **Strict Secret** |
| `SUPABASE_ANON_KEY` | Supabase public anon key (optional fallback) | Public / Private |
| `FRONTEND_URL` | Allowed CORS origin (Default: `http://localhost:5173`) | Private |

### Frontend (`frontend/.env`)

| Variable | Description | Exposure |
|---|---|---|
| `VITE_API_URL` | Express Backend REST API endpoint (Default: `http://localhost:5000/api`) | Public |
| `VITE_SUPABASE_URL` | Supabase project URL | Public |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Key (Safe for browser authentication) | Public |

> [!CAUTION]
> **Never commit `.env` files or share your `SUPABASE_SERVICE_ROLE_KEY` with the frontend repository!**

---

## 7. Supabase Setup Guide

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL**, **Anon Key**, and **Service Role Key** under **Project Settings -> API**.

### Step 2: Run Database Schema & Triggers
1. Navigate to the **SQL Editor** in your Supabase dashboard.
2. Open [`supabase/schema.sql`](supabase/schema.sql), paste its contents, and click **Run**.
3. Open [`supabase/rls.sql`](supabase/rls.sql), paste its contents, and click **Run** to enforce Row Level Security and create the `resources` storage bucket.

### Step 3: Run Database Seed Data
1. In the **SQL Editor**, open [`supabase/seed.sql`](supabase/seed.sql), paste its contents, and click **Run**.
2. This populates departments (CSE, CSE Cybersecurity, IT, ECE, EEE, Mechanical), course subjects, syllabus units, sample approved materials, and tags.

### Step 4: Storage Bucket Configuration
The `rls.sql` script creates the public `resources` storage bucket. You can also verify or configure it manually:
- Bucket Name: `resources`
- Public: `true` (or private if using strictly signed URLs)

### Step 5: Administrator Account & Student Provisioning

> **Demo Admin Account**
>
> Email: `admin@studyhub.local`  
> Password: `Admin@12345`  
>
> *Change/remove this account before production deployment.*

To provision or update the demo administrator account, run:
```bash
cd backend
npm run create:demo-admin
```
Or execute `supabase/create_demo_users.sql` directly in your Supabase **SQL Editor**.

Public student registration is **disabled**. Only authenticated Admins can create student profiles from `/admin/students` via the secure backend API (`POST /api/admin/students`). Student accounts are assigned `role = 'student'` and `status = 'active'`. Deactivated students are prevented from logging in.

---

## 8. Local Setup & Running

### Prerequisites
- Node.js >= 18 (Tested on Node v22.14.0)
- npm >= 9

### 1. Clone the repository
```bash
git clone <repository_url>
cd student-note
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
# Fill in your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env
npm install
npm run dev
```
The backend API starts on **http://localhost:5000**.
Check health: `http://localhost:5000/api/health`

### 3. Configure Frontend
```bash
cd ../frontend
cp .env.example .env
# Fill in your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env
npm install
npm run dev
```
The frontend application starts on **http://localhost:5173**.

---

## 9. REST API Reference

### Health & Auth
- `GET /api/health`: Service health check
- `GET /api/auth/me`: Current session & profile inspection (Bearer token required)
- `POST /api/auth/logout`: Invalidate session

### Profile
- `GET /api/profile`: Retrieve profile with upload & bookmark statistics
- `PUT /api/profile`: Update name, college, department, semester

### Taxonomy
- `GET /api/departments`: List all departments
- `GET /api/departments/:id`: Department details with subjects
- `POST /api/departments`: Create department (Admin only)
- `PUT /api/departments/:id`: Update department (Admin only)
- `DELETE /api/departments/:id`: Delete department (Admin only)
- `GET /api/subjects`: List active curriculum subjects with `?department_id=` and `?semester=`
- `GET /api/subjects/:id`: Subject details with unit list
- `GET /api/subjects/:subjectId/units`: List all syllabus units for subject
- `POST /api/admin/subjects`: Create subject (Admin only)
- `PUT /api/admin/subjects/:id`: Update subject (Admin only)
- `DELETE /api/admin/subjects/:id`: Delete subject with dependency safeguards (Admin only)
- `PATCH /api/admin/subjects/:id/status`: Toggle active / inactive status (Admin only)
- `POST /api/admin/subjects/:subjectId/units`: Create syllabus unit (Admin only)
- `PUT /api/admin/units/:id`: Update unit (Admin only)
- `DELETE /api/admin/units/:id`: Delete unit (Admin only)

### Resources & Search
- `GET /api/resources/search`: Multi-parameter search (`?q=&department=&semester=&subject=&unit=&resourceType=&sort=&page=&limit=`)
- `GET /api/resources/:id`: Resource details with ratings, signed URL, view counter
- `POST /api/resources`: Upload resource (Multipart form with PDF magic bytes check; `status = pending`)
- `PUT /api/resources/:id`: Edit resource (Owner if pending, or Admin)
- `DELETE /api/resources/:id`: Delete resource
- `POST /api/resources/:id/view`: Increment view counter
- `POST /api/resources/:id/download`: Increment download counter
- `GET /api/resources/my-uploads`: Authenticated student's uploaded materials with status

### Bookmarks
- `GET /api/bookmarks`: List user's saved notes
- `POST /api/bookmarks`: Save resource (Unique constraint enforced)
- `DELETE /api/bookmarks/:resourceId`: Remove bookmark

### Ratings & Reviews
- `GET /api/resources/:id/ratings`: List peer reviews
- `POST /api/resources/:id/ratings`: Submit 1–5 star rating and review
- `PUT /api/resources/:id/ratings/:ratingId`: Edit review
- `DELETE /api/resources/:id/ratings/:ratingId`: Delete review

### Moderation & Administration
- `GET /api/admin/statistics`: Platform metrics summary
- `GET /api/admin/resources/pending`: Review queue of pending materials
- `PATCH /api/admin/resources/:id/approve`: Approve and publish resource
- `PATCH /api/admin/resources/:id/reject`: Reject resource with feedback reason
- `DELETE /api/admin/resources/:id`: Permanently delete resource
- `GET /api/admin/reports`: List flagged content tickets
- `PUT /api/admin/reports/:id`: Update report status (`reviewed`, `resolved`, `dismissed`)
- `GET /api/admin/users`: User directory with role filtering & pagination
- `PATCH /api/admin/users/:id/role`: Update user role (`student`, `moderator`, `admin`)

---

## 10. Security Implementation

1. **HTTP Security Headers**: Powered by `helmet` to protect against clickjacking, MIME-type sniffing, and cross-site scripting.
2. **CORS Whitelisting**: Strict origin controls prevent unauthorized cross-origin requests.
3. **Rate Limiting**:
   - General API: 500 req / 15 min
   - Authentication: 50 req / 15 min
   - File Uploads: 20 uploads / 15 min
   - Search: 120 req / min
   - Reports: 15 reports / 15 min
4. **File Upload Hardening**:
   - Extension verification (`.pdf`)
   - MIME type verification (`application/pdf`)
   - **Magic Byte Inspection**: Verifies `%PDF-` signature at byte offset 0 of uploaded buffers.
   - Max size limit: 20MB
   - Safe collision-free UUID filenames (`resources/{dept}/{sem}/{subj}/{uuid}.pdf`).
5. **Database Authorization**:
   - Row Level Security (RLS) policies prevent unauthorized read/write.
   - Backend `requireRole` middleware prevents students from approving materials or modifying departments.

---

## 11. Testing & Verification

Run the automated backend test suite:
```bash
cd backend
npm test
```
The test suite verifies:
- API health and 404 handler responses
- Unauthenticated access rejection (401) on protected routes
- Role verification logic
- Resource search and pagination

To build and check frontend production compilation:
```bash
cd frontend
npm run build
```

---

## 12. Production Deployment

### Frontend (e.g. Vercel)
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Configure environment variables: `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

### Backend (e.g. Render / Railway)
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Configure environment variables: `PORT`, `NODE_ENV=production`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`.

---

## 13. License
MIT License. Created for students and academic communities.
