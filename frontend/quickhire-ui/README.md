# QuickHire Frontend

QuickHire is an Angular application for job seekers and recruiters. The UI includes
public job browsing, authentication screens, job applications, recruiter job
management, applicant views, and HR screens for employees and departments.

## Requirements

- Node.js and npm versions supported by Angular 22
- The QuickHire API for backend-connected features
- A configured backend database and JWT signing key when running the API locally

## Run locally

From this directory (`frontend/quickhire-ui`):

```powershell
npm install
npm start
```

The Angular development server runs at `http://localhost:4200` by default. To use
another port, for example `4300`:

```powershell
npm start -- --port 4300
```

The API base URL is configured in `src/environments/environment.ts` and currently
points to `http://localhost:5045`. Update that value for another local API address.
The API's development CORS configuration allows `http://localhost:4200` by
default; add the frontend origin to the backend's `Cors:AllowedOrigins` when using
a different port.

The local API uses ASP.NET Core. Its launch profile serves HTTP at
`http://localhost:5045` and HTTPS at `https://localhost:7221`. Follow the backend
README and local user-secrets/environment configuration for the database
connection and JWT signing key. Do not add credentials or secrets to this
frontend repository.

## Build and tests

```powershell
npm run build
npm test -- --watch=false
```

The production build is written to `dist/quickhire-ui`.

## Frontend/API integration

The shared API base URL is provided through `API_CONFIG`. Current integrations:

| Feature | Endpoint | Notes |
| --- | --- | --- |
| Sign in | `POST /api/auth/login` | Sends `{ "email": "...", "password": "..." }`. The response supplies an access token, expiry, display name, and roles. |
| Public job listings | `GET /api/jobs` | Returns active postings with ID, title, description, status, and posted date. |
| Employee and department screens | `GET/POST/PUT/DELETE /api/employees`, `GET /api/departments` | Protected API requests include the signed-in user's bearer token. |

The authentication interceptor attaches the access token to API requests. Sign-in
errors and API errors are shown in the UI; a `401` clears the local session and
returns the user to sign-in. Client-side route guards only control navigation and
do not replace backend authorization.

## Current API limitations

The backend currently supports `Recruiter`, `Employee`, and `Administrator`
roles, but does not provide JobSeeker registration or a JobSeeker sign-in role.
The registration screen is therefore intentionally unavailable until the API
supports account creation.

The application form keeps its required resume/CV field, phone number, and
optional cover letter. The current application endpoint accepts only first name,
last name, email, and job ID; it has no file-upload support and cannot accept the
phone number or cover letter. For that reason, application data and the selected
resume are saved in this browser only and are **not sent to the employer**.
My Applications and recruiter applicant views also use that local browser
storage. Connect these features to the server once the backend provides the
necessary JobSeeker authentication and application/file-upload contract.

The public jobs endpoint does not include company, location, salary, category,
job type, or requirements. Those fields may be blank in views backed by the API
until the API's job response includes them.

## Main frontend areas

- `src/app/features/landing` — landing page and role-specific calls to action
- `src/app/features/auth` — sign-in and registration screens
- `src/app/features/applicant` — public job browsing, job details, application
  form, and locally stored application history
- `src/app/features/recruiter` — recruiter job and applicant screens
- `src/app/features/employees` and `src/app/features/departments` — HR screens
- `src/app/core/api` — API configuration and HTTP interceptors
- `src/app/core/services` — authentication and public job API access

Routes are registered in `src/app/app.routes.ts`; feature pages are lazy-loaded.
