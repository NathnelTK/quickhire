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

## Current Foundation

The solution contains the four backend projects and the dependency references above. The Domain has the initial entities and status enums named in the execution plan. EF Core, PostgreSQL configuration, use cases, authentication, and the Angular workspace remain subsequent setup tasks. The Angular folder and data-flow conventions are documented separately; frontend implementation remains with the frontend developer.