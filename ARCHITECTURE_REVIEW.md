# Project Architecture Review (Phase 1)

## Current structure overview

- The repository is a monorepo with `frontend` (Next.js) and `backend` (NestJS).
- Domain modules in backend already exist (`auth`, `products`, `sales`, `users`, `upload`, `categories`).
- Frontend currently mixes domain logic in stores and direct `fetch` calls.
- Demo behavior is centralized in `frontend/lib/demo/mock-db.ts`.

## Main issues found

1. Service access was not centralized in frontend:
   - Multiple stores called `fetch` directly.
   - Request error handling was duplicated and inconsistent.
2. Auth module used weak typing:
   - `auth.controller.ts` accepted `any` request body.
   - `auth.service.ts` repeated profile mapping logic.
3. Secret leakage risk:
   - `.gitignore` rules were incomplete for wildcard env files and temp artifacts.

## Changes completed in this phase

- Added a reusable HTTP client module in frontend:
  - `frontend/lib/services/core/api-client.ts`
- Converted auth and user API access into dedicated domain services:
  - `frontend/lib/services/auth.service.ts`
  - `frontend/lib/services/user.service.ts`
- Refactored stores to consume services instead of direct `fetch`:
  - `frontend/store/auth.store.ts`
  - `frontend/store/user.store.ts`
- Kept demo/mock data untouched:
  - `frontend/lib/demo/mock-db.ts` was not modified.
- Improved backend auth module typing and clean structure:
  - Added DTO/type files in `backend/src/auth/dto/`
  - Reduced duplication in `backend/src/auth/auth.service.ts`
  - Removed `any` from `backend/src/auth/auth.controller.ts`
- Hardened ignore rules for env and generated files:
  - `.gitignore` (root)
  - `backend/.gitignore`
  - `frontend/.gitignore` (new)

## Recommended next modular phases

### Phase 2: Backend module boundaries

- Add `common` module for shared guards, decorators, and API response patterns.
- Enforce DTO + request validation for all controllers.
- Introduce repository layer per domain to separate DB access from use-cases.

### Phase 3: Frontend feature modules

- Group UI + state + services per domain (`features/products`, `features/sales`, ...).
- Keep stores minimal (state orchestration only), move business rules to services.
- Standardize error handling and toast message mapping.

### Phase 4: Quality gates

- Add lint + typecheck + test pipelines at root level.
- Add test coverage for domain services and auth flow.
- Add secret scanning in CI to prevent accidental env leaks.
