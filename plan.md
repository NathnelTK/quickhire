# QuickHire — Project Execution Plan & Team Roadmap

## 1. Executive Summary & Team Roles

**QuickHire** is a lightweight Human Resource Management System (HRMS) designed as a pre-hackathon team warm-up project. The main goal is to align coding practices, establish an efficient Git workflow, and get comfortable with the project stack.

### Team Responsibilities Matrix

| Name | Role | Core Responsibilities | Target Deliverables |
| :--- | :--- | :--- | :--- |
| **Roman** | Frontend Developer | - Angular project setup & structure<br>- Reactive Forms & Client-side validation<br>- HTTP Services & State integration<br>- UI/UX implementation | Functional HR Dashboard, Employee Management Views, Job Application UI |
| **Negeda** | Backend Developer (Core HR) | - Core Domain Models & Entities<br>- Employee Management API Endpoints<br>- Application Layer Services & DTOs<br>- Validation (FluentValidation) | RESTful APIs for Employee CRUD, Department management, unit/integration tests |
| **Sami** | Backend Developer (Recruitment) | - Recruitment Domain Logic<br>- Job Posting & Applicant Workflows<br>- Business rules & Status updates<br>- Integration with EF Core | RESTful APIs for Job Openings, Applicant submissions, status tracking |
| **Fourth Member** | Database Engineer | - PostgreSQL Schema design<br>- EF Core Data Annotations / Fluent API<br>- Database Migrations & Seeding<br>- Indexing & Query Optimization | `AppDbContext`, EF Migrations, Database Seeding Scripts for sample data |
| **Team Lead** *(You)* | DevOps, QA & Code Reviewer | - Repository management & Branch Protection<br>- PR Reviews & Merge Conflict resolution<br>- CI/CD & Cloud Deployment<br>- Postman / OpenAPI Documentation | CI/CD Pipelines, Docker setup, Production Deployment, Master API Docs |

---

## 2. Tech Stack & Architecture Overview

### Tech Stack Breakdown
* **Frontend:** Angular (Latest LTS), TypeScript, RxJS, HTML5/SCSS, Tailwind CSS or Angular Material.
* **Backend:** .NET (C#), ASP.NET Core Web API.
* **Persistence & ORM:** PostgreSQL, Entity Framework Core (EF Core).
* **Architecture:** Onion Architecture (Clean Architecture).

### Onion Architecture Layers

```
QuickHire.Api ───────────────► QuickHire.Application
  │                               │
  └──────────────────────► QuickHire.Infrastructure
              │
QuickHire.Infrastructure ────────────┤
QuickHire.Application ───────────────┴──► QuickHire.Domain
```

Arrows indicate project references, not runtime call order. The Domain has no project references. Application references only Domain. Infrastructure references Application and Domain. API is the composition root and references Application and Infrastructure. Keep these rules in sync with [ARCHITECTURE.md](ARCHITECTURE.md).

1. **Domain Layer (`QuickHire.Domain`):** No external dependencies. Contains entities (`Employee`, `Department`, `JobPosting`, `Applicant`), business enums, and custom exceptions. It must not reference ASP.NET Core Identity or inherit from `IdentityUser`.
2. **Application Layer (`QuickHire.Application`):** Contains DTOs, interfaces for repositories, business service contracts, mapping profiles, and validation logic.
3. **Infrastructure Layer (`QuickHire.Infrastructure`):** Implements `AppDbContext`, EF Core configurations, repository patterns, migrations, and database seeders.
4. **Web API Layer (`QuickHire.Api`):** Controllers, Middleware (Global exception handling, CORS), Dependency Injection registration, and Swagger configuration.

### Authentication Decision & Layer Ownership

The MVP uses **ASP.NET Core Identity** for user storage and **JWT Bearer Authentication** for API access. Access tokens expire after **12 hours**; refresh tokens are out of scope for the MVP.

- **Domain:** Remains framework-independent. Do not derive a Domain entity from `IdentityUser`; the Identity user is an infrastructure persistence concern.
- **Application:** Owns login use-case contracts, request/response DTOs, validation, and the token-issuing abstraction.
- **Infrastructure:** Adds `Microsoft.AspNetCore.Identity.EntityFrameworkCore`, defines an Identity user (for example, `ApplicationUser : IdentityUser<Guid>`), integrates Identity with `AppDbContext`, and implements token issuance.
- **API:** Adds `Microsoft.AspNetCore.Authentication.JwtBearer`, exposes `POST /api/auth/login`, validates JWT signature, issuer, audience, and lifetime, and protects employee/recruitment endpoints with `[Authorize]`. The login endpoint is `[AllowAnonymous]`.
- **Angular:** Adds a login flow and `AuthService`, stores the access token in `localStorage` for this MVP, attaches it with an HTTP interceptor, and uses an auth guard for private routes. The guard is for navigation only; the API remains the security boundary.

Keep signing keys out of source control and frontend configuration. Use .NET user-secrets locally and environment-provided secrets in deployed environments. Since JavaScript can read `localStorage`, an XSS vulnerability could expose the token; use HTTPS and revisit HttpOnly-cookie/BFF storage before production.

Authentication must be integrated with the Identity database schema before the feature API PRs are protected. Agree on role names and claims across the backend and frontend before enforcing role-based authorization.

---

## 3. Workflow & Git Strategy

To maintain clean history and prevent major merge conflicts, follow this Git workflow strictly:

### Branch Naming Conventions
* **Features:** `feature/<developer_name>-<feature_description>` (e.g., `feature/roman-employee-list-ui`)
* **Bug fixes:** `fix/<developer_name>-<bug_description>` (e.g., `fix/sami-applicant-status-bug`)
* **Database:** `db/<developer_name>-<migration_name>` (e.g., `db/fourth-initial-migration`)

### Git Workflow Rules
1. **No Direct Commits to `main`:** All code changes must enter `main` via a Pull Request (PR).
2. **Daily Rebase/Pull:** Run `git pull origin main` or `git rebase main` on your feature branch at the start of every working session.
3. **Review Policy:** Every PR requires approval from the **Team Lead** before merging.
4. **PR Size Limit:** Keep PRs under **300 lines of code** where possible for fast and thorough code reviews.

---

## 4. Master Pull Request (PR) Sequence

Follow this dependency sequence step-by-step so team members are not blocked by each other.

```
PR #1: Project Base Structure Setup (Lead / DB)
  │
  ├─► PR #2: Database, Identity & JWT Foundation (Fourth Member, Negeda, Sami)
  │     │
  │     ├─► PR #3: Employee API Module (Negeda) ───┐
  │     │                                           ├──► PR #6: Integration & Final Polish
  │     └─► PR #4: Job & Applicant API (Sami)  ───┤
  │                                                 │
  └─► PR #5: Angular App & Base UI (Roman) ─────────┘
```

---

### Step 1: Base Setup & Solution Blueprint
* **PR Target:** `PR #1: Setup Onion Architecture Solution`
* **Assignee:** Team Lead & Fourth Member
* **Tasks:**
  * Create .NET solution (`QuickHire.sln`) with the 4 Onion projects.
  * Define core domain entities (`Employee`, `Department`, `JobPosting`, `Applicant`).
  * Configure Angular application workspace (`quickhire-ui`).
* **Acceptance Criteria:** Solution builds cleanly; Angular app serves default page.

---

### Step 2: Database, Identity & Authentication Foundation
* **PR Target:** `PR #2: Database, Identity & JWT Foundation`
* **Assignee:** Fourth Member (database), Negeda & Sami (backend authentication)
* **Tasks:**
  * Configure `AppDbContext` and entity relationships (One-to-Many: Department -> Employees; JobPosting -> Applicants).
  * Configure ASP.NET Core Identity in Infrastructure and include its schema in the initial EF Core migration (`InitialCreate`).
  * Implement the Application login contract and Infrastructure Identity/token services.
  * Configure JWT Bearer validation and `POST /api/auth/login` in the API; keep the signing key in user-secrets or environment configuration.
  * Set access-token expiry to 12 hours; omit refresh tokens for the MVP.
  * Create database seeder with realistic test data (5 departments, 10 employees, 3 job postings).
* **Acceptance Criteria:** `dotnet ef database update` executes cleanly against a local PostgreSQL database, creates the Identity schema, and populates sample data. Valid credentials receive a signed 12-hour token; invalid credentials receive `401 Unauthorized`.

---

### Step 3: Backend Business Modules

#### Module A: Employee Management
* **PR Target:** `PR #3: Employee Management API`
* **Assignee:** Negeda
* **Tasks:**
  * Create `EmployeeDto`, `CreateEmployeeDto`, `UpdateEmployeeDto`.
  * Implement `IEmployeeService` and `EmployeeService`.
  * Build `EmployeesController` (`GET /api/employees`, `GET /api/employees/{id}`, `POST /api/employees`, `PUT /api/employees/{id}`, `DELETE /api/employees/{id}`) and protect it with `[Authorize]`.
* **Acceptance Criteria:** All CRUD operations work via Swagger UI with validation on required fields; requests without a valid bearer token receive `401 Unauthorized`.

#### Module B: Recruitment & Hiring Workflow
* **PR Target:** `PR #4: Job Postings & Applicant Workflow API`
* **Assignee:** Sami
* **Tasks:**
  * Create `JobPostingDto` and `ApplicantDto`.
  * Implement service for handling job creation, status updates (`Open`, `Closed`), and application submissions.
  * Build `JobsController` and `ApplicantsController`; protect HR operations with `[Authorize]`.
* **Acceptance Criteria:** Candidates can submit applications to active job postings; HR can update application status (`Received`, `Interviewing`, `Hired`, `Rejected`); protected HR endpoints reject requests without a valid bearer token.

---

### Step 4: Frontend Development
* **PR Target:** `PR #5: Angular Core Layout & HR Dashboard`
* **Assignee:** Roman
* **Tasks:**
  * Implement navigation layout (Header, Sidebar, Routing Module).
  * Implement login UI and `AuthService` for `POST /api/auth/login`.
  * Store the access token in `localStorage`, attach it to API requests with an HTTP interceptor, and protect private routes with an auth guard.
  * Create `EmployeeService` and `JobService` in Angular using `HttpClient`.
  * Build components:
    * **Employee List & Form:** Data table with search/filter, dialog form for creating/editing employees.
    * **Job Openings View:** Cards showing active job postings and a submission form for applicants.
* **Acceptance Criteria:** A user can log in, navigate protected routes, and call protected API endpoints with the bearer token; UI loading states and error feedback are displayed. Unauthenticated users are redirected by the guard, and the API independently returns `401 Unauthorized` for protected requests.

---

### Step 5: Final Integration, Review & Deployment
* **PR Target:** `PR #6: System Integration & CORS Fixes`
* **Assignee:** Team Lead (with full team)
* **Tasks:**
  * Enable CORS in .NET Web API to allow requests from Angular frontend (`http://localhost:4200`).
  * Test end-to-end user workflows (Creating an employee, posting a job, submitting an application).
  * Containerize application using Docker (optional) or deploy backend and database to cloud services (e.g., Render, Railway, Fly.io, or Azure).
* **Acceptance Criteria:** Live public URL for both Frontend and Backend API; zero console errors during standard operation.

---

## 5. Team Progress Checklist

Use this checklist during standup meetings to monitor status:

- [ ] **Phase 1: Foundation**
  - [ ] Git repo initialized with branch protection rule on `main`
  - [ ] Onion architecture solution created
  - [ ] Base Angular project configured

- [ ] **Phase 2: Database & Core Entities**
  - [ ] PostgreSQL connected locally
  - [x] Initial EF Core migration generated
  - [x] Identity schema included in additive migration; JWT login returns a signed token
  - [x] Seed data populated

- [ ] **Phase 3: APIs & Business Logic**
  - [x] Protected endpoints reject missing or invalid bearer tokens
  - [x] Employee API endpoints verified against PostgreSQL
  - [x] Job Posting & Applicant endpoints verified against PostgreSQL
  - [ ] Global exception handling middleware added

- [ ] **Phase 4: Frontend & UI Integration**
  - [x] Angular Layout & Navigation functional
  - [x] Login, token interceptor, and private-route guard implemented
  - [x] Employee CRUD views connected to API
  - [x] Public jobseeker and protected recruiter workflows separated

- [ ] **Phase 5: Release & Deployment**
  - [x] Cross-Origin Resource Sharing (CORS) configured
  - [x] Backend end-to-end workflows verified against PostgreSQL
  - [ ] Final deployment completed