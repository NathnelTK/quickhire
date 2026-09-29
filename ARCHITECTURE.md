# QuickHire Architecture

## Project Layout

```text
QuickHire.sln
backend/
  QuickHire.Domain/          Business concepts and rules
  QuickHire.Application/     Use cases, contracts, DTOs, validation
  QuickHire.Infrastructure/  EF Core, PostgreSQL, external adapters
  QuickHire.Api/             HTTP endpoints and application composition
frontend/                    Angular client (separate application)
```

Frontend folder and data-flow conventions are documented in [frontend/ARCHITECTURE.md](frontend/ARCHITECTURE.md). The frontend intentionally uses feature-oriented Angular organization rather than copying the backend's Onion project layers.

## Dependency Direction

Project references point inward toward the Domain:

```text
Api -> Application
Api -> Infrastructure
Infrastructure -> Application
Infrastructure -> Domain
Application -> Domain
Domain -> no QuickHire project
```

The API is the composition root: it registers Application and Infrastructure services. Application defines ports that Infrastructure implements. Domain must not depend on ASP.NET Core, EF Core, PostgreSQL, Angular, or any other outer-layer framework. The frontend communicates with the API over HTTP and never references backend projects.

## What Goes Where

| Project | Put this here | Keep out |
| --- | --- | --- |
| `QuickHire.Domain` | Entities, value objects, domain enums, invariants | DTOs, EF configuration, controllers, framework dependencies |
| `QuickHire.Application` | Use cases, request/response DTOs, validation, repository/service interfaces | HTTP concerns, EF implementations, database-specific queries |
| `QuickHire.Infrastructure` | `AppDbContext`, EF configurations, migrations, repository implementations, external services | Business decisions that belong in Domain or Application |
| `QuickHire.Api` | Controllers, middleware, API configuration, dependency registration | Business workflows and persistence logic |
| Angular client | Screens, client-side forms, HTTP clients, presentation state | Business rules that must also be enforced by the server |

## Feature Ownership

- **Employee and department work:** Domain entities and rules in Domain; use cases, DTOs, and ports in Application; persistence adapters in Infrastructure; HTTP endpoints in Api.
- **Jobs and applicants:** Follow the same layer split. Keep recruitment workflows in Application and business invariants in Domain.
- **Database work:** The database owner changes Infrastructure and its tests/migrations. Do not put EF attributes or `DbContext` references in Domain.
- **Frontend work:** The Angular owner works only in the frontend application and consumes documented API contracts.
- **Integration and review:** The team lead owns API composition, cross-layer review, and delivery configuration.

## Team Rules

1. Add a project reference only in the directions listed above.
2. Controllers translate HTTP input to an Application request and translate the result to an HTTP response; they do not call `DbContext`.
3. Application owns use-case contracts and validation. Infrastructure implements its persistence and external-service contracts.
4. Keep API DTOs out of Domain. Domain entities are not API response models.
5. Add tests beside the layer being tested: domain/application unit tests, infrastructure/API integration tests, and frontend tests for UI behavior.
6. Agree on unresolved vocabulary (especially authorization roles) with the team before implementing authentication or access policies.

## Authentication Boundaries

- `QuickHire.Domain` stays independent of ASP.NET Core Identity. Do not make a Domain user inherit from `IdentityUser`.
- `QuickHire.Application` defines login use-case contracts, DTOs, validation, and the token-issuing abstraction.
- `QuickHire.Infrastructure` owns the Identity user type and persistence integration (for example, `ApplicationUser : IdentityUser<Guid>` and an Identity-aware `AppDbContext`), plus the token-issuing implementation.
- `QuickHire.Api` configures JWT Bearer validation and exposes the login endpoint. Protect HR endpoints with `[Authorize]`; allow anonymous access only where intended, such as login and any explicitly public applicant submission flow.
- Keep signing keys in .NET user-secrets during development and environment-provided secrets in deployed environments. Never commit signing keys or put them in Angular configuration.
- MVP access tokens expire after 12 hours; refresh tokens are deferred. Validate signature, issuer, audience, and lifetime.

## Current Foundation

The backend provides PostgreSQL persistence, EF Core mappings, business and ASP.NET Identity migrations, employee and department CRUD, and job/application workflows. Development startup applies migrations and seeds roles, demo users, five departments, ten employees, three job postings, and sample applicants. The local demo users are `admin@quickhire.local`, `recruiter@quickhire.local`, and `employee@quickhire.local`; the Development-only sample password is `QuickHireDemo!2026`. Override it with `DemoUsers:Password` when needed.

Configure `ConnectionStrings:DefaultConnection`, `Jwt:SigningKey` (at least 32 bytes), `Jwt:Issuer`, and `Jwt:Audience` for the target environment. Keep the signing key in User Secrets locally and in a secret manager/environment variable when deployed. Set `Cors:AllowedOrigins` to the deployed frontend origin.

The Angular client uses the API at `http://localhost:5045` in development. `/jobs` is the public jobseeker page; `/recruiter` is a separate role-guarded hiring workspace. Employee/department tools and the dashboard require team sign-in. Applicants may browse and apply without an account.

Start the API with `dotnet run --project backend/QuickHire.Api --launch-profile http`; start the UI from `frontend/quickhire-ui` with `npm start`. This is an MVP auth design: the UI stores bearer tokens in `localStorage`, so production deployment should use HTTPS, a strong managed signing key, and review the token-storage/XSS tradeoff.