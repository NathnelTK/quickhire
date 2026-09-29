# QuickHire Frontend Architecture

## Purpose

This is the structural guide for the Angular client. It defines where frontend work belongs; it does not implement screens, API calls, or the Angular workspace. The frontend is a separate application that communicates with `QuickHire.Api` over HTTP. It follows feature-oriented organization and does not reproduce the backend's project-layer structure.

## Application Structure

```text
frontend/quickhire-ui/src/app/
  core/                         App-wide infrastructure and shell
    layout/                     Header, navigation, and page frame
    api/                        API base URL and HTTP-wide configuration
    security/                   Auth guard and bearer-token interceptor
  shared/                       Reusable, feature-independent UI
    components/
    pipes/
  features/
    auth/
      pages/                    Login screen
      data-access/              AuthService and login HTTP call
      models/                   Login request/response types
      auth.routes.ts
    employees/
      pages/                    Route-level screens
      components/               Employee-specific UI
      data-access/              Employee HTTP service
      models/                   Frontend employee request/response types
      employees.routes.ts
    departments/
      pages/
      components/
      data-access/
      models/
      departments.routes.ts
    recruitment/
      pages/                    Job openings and application screens
      components/               Recruitment-specific UI and forms
      data-access/              Job and applicant HTTP services
      models/                   Frontend job and applicant types
      recruitment.routes.ts
  app.routes.ts                 Top-level lazy route registration
  app.config.ts                 Root providers
```

The exact filenames can follow the Angular CLI version and team conventions; keep the ownership boundaries above.

## Responsibilities

- **Core:** App shell, top-level navigation, API configuration, and cross-cutting HTTP concerns. Keep feature-specific code out of Core.
- **Shared:** Reusable presentation components and pipes with no employee, department, or recruitment business rules and no feature API calls. Promote code here only when it is genuinely reused.
- **Features:** Each feature owns its pages, feature-specific components, API services, frontend types, and routes. Keep related changes together so a contributor can work within one feature.
- **Pages:** Compose components, load feature data, and coordinate user actions. Pages are route-level containers, not a second location for HTTP implementation.
- **Components:** Render inputs and emit user actions. Keep them focused on presentation and local interaction.
- **Data access:** Feature services use Angular `HttpClient` and return typed results. They own endpoint paths and HTTP calls, not visual state or business rules that the API must enforce.
- **Models:** Define frontend request and response shapes based on the API contract. Do not import C# types or treat backend Domain entities as frontend models.

## Routing and Data Flow

1. Register each feature's routes from `app.routes.ts` using lazy loading.
2. Route-level pages call their feature's data-access service; components receive data and emit actions through inputs and outputs.
3. Feature services call the API over HTTP and use feature-owned TypeScript types.
4. Reactive forms handle client-side input and feedback. The API remains authoritative for validation and business rules.
5. Keep server state close to the page that uses it. Add a shared state library only if the team demonstrates a cross-feature need.

## Authentication

- `features/auth/` owns the login page, `AuthService`, and login request/response types for `POST /api/auth/login`.
- `core/security/` owns the route guard and HTTP interceptor. The interceptor attaches `Authorization: Bearer <token>` to requests to the QuickHire API only.
- Store the MVP access token in `localStorage` as agreed by the team. A route guard only controls client navigation; protected API endpoints must validate the token independently.
- The backend issues 12-hour access tokens and does not use refresh tokens in the MVP. Never store signing keys or other server secrets in the frontend.
- `localStorage` is readable by JavaScript, so an XSS vulnerability can expose the token. Use HTTPS and revisit HttpOnly-cookie/BFF storage before production.

## Team Conventions

1. Put employee and department work in their corresponding feature folders; put jobs and applicant workflows in `features/recruitment/`.
2. Do not call `HttpClient` from templates or presentational components.
3. Do not put feature-specific code in `shared/` just to avoid choosing an owner folder.
4. Keep API base URLs in Angular environment/configuration files. Never put credentials or secrets in frontend configuration.
5. Add tests beside the feature or component they cover, using the test setup generated by the chosen Angular CLI version.
6. Agree with the API contributors on endpoint paths and JSON request/response shapes before integrating a feature.
7. Keep authentication UI and token storage in the auth feature/security boundary; don't treat the route guard as server-side authorization.

## Suggested Work Ownership

- **Roman:** Angular workspace, app shell, navigation, employee UI, recruitment UI, and API integration.
- **API contributors:** Publish endpoint paths and request/response contracts for the employee, department, job, and applicant features.
- **Team lead:** Review cross-feature conventions and coordinate frontend/backend integration.