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
                       ┌─────────────────────────────────┐
                       │           Web API               │
                       │   (Controllers, Swagger, Middleware)
                       └────────────────┬────────────────┘
                                        │
                       ┌────────────────▼────────────────┐
                       │         Infrastructure          │
                       │ (EF Core, DbContext, Auth, Mail)│
                       └────────────────┬────────────────┘
                                        │
                       ┌────────────────▼────────────────┐
                       │          Application            │
                       │   (Services, CQRS, DTOs, Interfaces)
                       └────────────────┬────────────────┘
                                        │
                       ┌────────────────▼────────────────┐
                       │            Domain               │
                       │   (Entities, Enums, Interfaces) │
                       └─────────────────────────────────┘
```

1. **Domain Layer (`QuickHire.Domain`):** No external dependencies. Contains entities (`Employee`, `Department`, `JobPosting`, `Applicant`), enums (`JobStatus`, `Role`), and custom exceptions.
2. **Application Layer (`QuickHire.Application`):** Contains DTOs, interfaces for repositories, business service contracts, mapping profiles, and validation logic.
3. **Infrastructure Layer (`QuickHire.Infrastructure`):** Implements `AppDbContext`, EF Core configurations, repository patterns, migrations, and database seeders.
4. **Web API Layer (`QuickHire.Api`):** Controllers, Middleware (Global exception handling, CORS), Dependency Injection registration, and Swagger configuration.

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
  ├─► PR #2: Database Schema & Migrations (Fourth Member)
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

### Step 2: Database Layer & Data Access
* **PR Target:** `PR #2: EF Core DbContext & Migrations Setup`
* **Assignee:** Fourth Member
* **Tasks:**
  * Configure `AppDbContext` and entity relationships (One-to-Many: Department -> Employees; JobPosting -> Applicants).
  * Add EF Core migration (`InitialCreate`).
  * Create database seeder with realistic test data (5 departments, 10 employees, 3 job postings).
* **Acceptance Criteria:** `dotnet ef database update` executes cleanly against a local PostgreSQL database and populates sample data.

---

### Step 3: Backend Business Modules

#### Module A: Employee Management
* **PR Target:** `PR #3: Employee Management API`
* **Assignee:** Negeda
* **Tasks:**
  * Create `EmployeeDto`, `CreateEmployeeDto`, `UpdateEmployeeDto`.
  * Implement `IEmployeeService` and `EmployeeService`.
  * Build `EmployeesController` (`GET /api/employees`, `GET /api/employees/{id}`, `POST /api/employees`, `PUT /api/employees/{id}`, `DELETE /api/employees/{id}`).
* **Acceptance Criteria:** All CRUD operations work via Swagger UI with validation on required fields.

#### Module B: Recruitment & Hiring Workflow
* **PR Target:** `PR #4: Job Postings & Applicant Workflow API`
* **Assignee:** Sami
* **Tasks:**
  * Create `JobPostingDto` and `ApplicantDto`.
  * Implement service for handling job creation, status updates (`Open`, `Closed`), and application submissions.
  * Build `JobsController` and `ApplicantsController`.
* **Acceptance Criteria:** Candidates can submit applications to active job postings; HR can update application status (`Received`, `Interviewing`, `Hired`, `Rejected`).

---

### Step 4: Frontend Development
* **PR Target:** `PR #5: Angular Core Layout & HR Dashboard`
* **Assignee:** Roman
* **Tasks:**
  * Implement navigation layout (Header, Sidebar, Routing Module).
  * Create `EmployeeService` and `JobService` in Angular using `HttpClient`.
  * Build components:
    * **Employee List & Form:** Data table with search/filter, dialog form for creating/editing employees.
    * **Job Openings View:** Cards showing active job postings and a submission form for applicants.
* **Acceptance Criteria:** UI connects to backend endpoints; loading states and error toasts are displayed.

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
  - [ ] Initial EF Core migration generated
  - [ ] Seed data populated

- [ ] **Phase 3: APIs & Business Logic**
  - [ ] Employee API endpoints verified in Swagger
  - [ ] Job Posting & Applicant endpoints verified in Swagger
  - [ ] Global exception handling middleware added

- [ ] **Phase 4: Frontend & UI Integration**
  - [ ] Angular Layout & Navigation functional
  - [ ] Employee CRUD views connected to API
  - [ ] Job Posting views connected to API

- [ ] **Phase 5: Release & Deployment**
  - [ ] Cross-Origin Resource Sharing (CORS) configured
  - [ ] Full end-to-end integration verified
  - [ ] Final deployment completed