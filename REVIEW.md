# Code Review: Mobile Management Frontend

**Reviewer:** Claude Code
**Date:** 2026-03-17
**Branch:** main
**Stack:** React 19 · TypeScript 5.9 · Vite 7 · Tailwind CSS 4 · MUI 7 · React Router 7

---

## Table of Contents

1. [Project Summary](#1-project-summary)
2. [Architecture Decisions](#2-architecture-decisions)
3. [What's Done Well](#3-whats-done-well)
4. [What Needs Improvement](#4-what-needs-improvement)
5. [Critical Issues](#5-critical-issues)
6. [Security Concerns](#6-security-concerns)
7. [Performance](#7-performance)
8. [Testing](#8-testing)
9. [Dependency Audit](#9-dependency-audit)
10. [Prioritized Recommendations](#10-prioritized-recommendations)
11. [Portfolio Assessment](#11-portfolio-assessment)

---

## 1. Project Summary

A corporate mobile device and phone-line management SPA (TFG/degree project). Two roles — Admin and Client — each with their own layout, dashboard, and CRUD pages for devices, lines, and users. Connects to a Spring Boot backend at `localhost:8080`.

The project is **more complete than typical student work**: it has real UX polish, responsive layouts, dark mode, animated transitions, and a layered architecture. The issues found are mostly things that separate a demo from a production-grade app — not fundamental misunderstandings.

---

## 2. Architecture Decisions

### What was chosen and why it mostly works

**No global state library (Redux/Zustand)**
Each page owns its state through custom hooks (`useDevicesLogic`, `useLinesLogic`, `useUsersLogic`). This is a valid choice for a medium-sized app. The tradeoff is that cross-page communication becomes awkward. For this app's scope it is acceptable but the hooks have grown too large — see §4.

**Axios over fetch**
Reasonable. The centralized `http.ts` client means the base URL and future interceptors live in one place. The execution is incomplete (no interceptors, hardcoded URL) but the structure is correct.

**React Router v7 nested routes**
Two layout routes (`AdminLayout`, `ClientLayout`) with nested page routes is textbook React Router and is done correctly.

**Tailwind CSS + MUI in the same project**
This is a common source of friction. Tailwind handles layout and spacing; MUI provides interactive components (Dialog, Snackbar, Drawer). It works here because the two systems are used for different things rather than competing. The risk is that MUI's CSS-in-JS and Tailwind's utility classes can conflict on the same element — watch for this when MUI components appear inside Tailwind flex/grid containers.

**Context only for auth**
Only `AuthContext` uses React Context. Everything else is local state + hooks. This is a clean and deliberate call.

**Custom hook per domain entity**
`useDevicesLogic`, `useLinesLogic`, `useUsersLogic` — the pattern is sound (separate data logic from rendering). The problem is each hook does too much. See §4.

---

## 3. What's Done Well

### 3.1 UI/UX Quality
The visual output is noticeably above average for a student project. The landing page animation (Framer Motion), the responsive sidebar that transitions from permanent on desktop to a drawer on mobile, the dark mode that persists across sessions, and the consistent use of MUI Chips for status values all contribute to a professional feel.

### 3.2 Layered API Client
`src/api/` correctly separates HTTP concerns:
- `http.ts` creates a single Axios instance
- `clients.ts`, `devices.ts`, etc. each own one resource's endpoints
- `model/` holds DTO types that mirror backend responses

This is a real pattern used in production frontends. A junior who built this understands separation of concerns.

### 3.3 TypeScript Usage
The codebase is almost entirely typed. Model types in `src/api/model/` and `src/types/` cover the domain. Optional chaining and nullish coalescing are used correctly. This is not a project where TypeScript was bolted on as an afterthought.

### 3.4 Protected Routing
`ProtectedRoute` in `AppRouter.tsx` guards routes by role and redirects unauthenticated users to `/login`. The pattern is correct and extensible.

### 3.5 Responsive Design
Desktop and mobile layouts are handled at the layout level (`AdminLayout`, `ClientLayout`) using MUI's `useMediaQuery` and conditional Drawer variants. Pages themselves use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`). Both are used consistently.

### 3.6 Bulk Selection with Indeterminate State
The checkbox bulk-select pattern in device and line tables (select all, indeterminate on partial, per-row toggle) is correctly implemented including the indeterminate prop on MUI Checkbox. This detail is often missed.

### 3.7 Reusable UI Components
`src/components/ui/` contains `Button`, `Checkbox`, `Chips`, `StatusBadge`, and others. These are proper presentational components with variant props. The `Button` in particular uses Class Variance Authority — a modern pattern that shows awareness of contemporary tooling.

### 3.8 Status Translation Utilities
`src/utils/translate.ts` and `src/utils/statusTranslations.ts` centralize human-readable label mapping for statuses and types. This is better than inlining strings directly in JSX.

---

## 4. What Needs Improvement

### 4.1 Oversized Custom Hooks (Most Impactful)

`useDevicesLogic`, `useLinesLogic`, and `useUsersLogic` each handle:
- API fetching
- Search/filter state
- Bulk selection state
- Form dialog open/close state
- Form field state
- Create / update / delete mutations
- Snackbar notification state

Each is 200–300+ lines. This makes them hard to read, hard to test, and impossible to reuse at a granular level. The pattern of passing the entire hook's return value as props to the page component (20+ props) also makes the component signature unreadable.

**Concrete fix:** Split into at minimum three hooks per domain: one for fetching (`useDevices`), one for selection (`useDeviceSelection`), one for CRUD mutations (`useDeviceMutations`).

### 4.2 No Client-Side Form Validation

Form dialogs (`DeviceFormDialog`, `LineFormDialog`, `UserFormDialog`) submit directly to the API without validating inputs first. Errors only surface via server response, and even then the handling is inconsistent. This is a UX regression — the user gets no feedback until after a round-trip.

The standard fix: add `react-hook-form` + `zod` schema validation. Display inline field errors before submission.

### 4.3 No Pagination

All list pages load the entire dataset from the API in a single request. For a demo with 10 records this is fine. For anything real it will break. The admin's `AdminClientDetailPage` fires 7 parallel requests on mount — that is fine in principle but none of them are paginated.

Add `page`/`size` query parameters to API calls and pagination controls to list tables.

### 4.4 Inconsistent Error Handling

Some `.catch()` blocks `console.log` the error and do nothing. Some set a local error string but never display it. Some show a Snackbar. There is no consistent pattern.

The correct approach: create a shared error notification mechanism (MUI Snackbar + context or a lightweight toast library) and call it in every catch block. The infrastructure is already partially there.

### 4.5 Component File Length

Several page files exceed 300 lines:
- `AdminClientDetailPage.tsx` (~380 lines)
- `ClientDevicesPage/index.tsx` (large even after hook extraction)
- `AdminClientsPage.tsx`

Pages this long are a symptom of mixing layout, data wiring, and sub-component definition in one file. Extract sub-components to separate files (as was done for `ClientDashboard` — that folder structure is the right model to follow elsewhere).

### 4.6 Dead Code Not Cleaned Up

The following files exist in the repo and are either unreachable or explicitly replaced:
- `ClientDashboard_OLD.tsx`
- `ClientEditPage_OLD.tsx`
- `ClientDevicesPage_OLD.tsx`
- `Landing1Page.tsx`, `Landing2Page.tsx` (not used in any route)

Old files in a portfolio repo invite the question: "why is this still here?" Delete them or move to a separate branch before sharing the link.

### 4.7 Hardcoded Drawer Width

`const drawerWidth = 240` appears in both `AdminLayout.tsx` and `ClientLayout.tsx`. Extract to a shared constant in a `constants.ts` or `theme.ts` file.

### 4.8 Mixed Icon Libraries

The project imports from both `lucide-react` and `@heroicons/react`. Both are excellent libraries but using two for the same purpose adds bundle weight and signals indecision. Pick one and unify.

### 4.9 Three Charting Libraries

The project uses `recharts`, `chart.js` + `react-chartjs-2`, and `@mui/x-charts`. That is three charting libraries. Each adds significant bundle weight. Pick one (Recharts is the lightest and integrates most naturally with React) and remove the others.

### 4.10 No Accessibility Beyond the Basics

Tables have no `scope` on header cells. Icon-only buttons have no `aria-label`. Search inputs are missing associated labels in some places. This does not need to be perfect, but icon buttons should have `aria-label` and table headers should have `scope="col"`.

---

## 5. Critical Issues

These are issues that would cause real problems in any environment beyond a local demo.

### 5.1 Hardcoded Backend URL

**File:** `src/api/http.ts`

```typescript
// Current
baseURL: "http://localhost:8080"

// Should be
baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080"
```

Add a `.env.example` file documenting `VITE_API_URL`. Without this the project cannot be deployed anywhere without modifying source code.

**Severity:** High — breaks any deployment.

### 5.2 Auth State Lost on Page Refresh

**File:** `src/context/AuthContext.tsx`

`AuthContext` holds user and role in React state. React state does not persist across page refreshes. Pressing F5 logs the user out silently.

**Fix:**
```typescript
// On login
localStorage.setItem("auth", JSON.stringify({ user, role }));

// On mount in AuthContext
const stored = localStorage.getItem("auth");
if (stored) restoreAuthFromStorage(JSON.parse(stored));

// On logout
localStorage.removeItem("auth");
```

**Severity:** High — every user loses session on refresh.

### 5.3 No Auth Token Sent in API Requests

**File:** `src/api/http.ts`

There are no Axios request interceptors setting an `Authorization` header. If the Spring Boot backend requires authentication on its endpoints (any production-ready backend would), every API call will return 401 after page refresh.

**Fix:** Add an Axios request interceptor that reads the stored token from localStorage and attaches it:
```typescript
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

Also add a response interceptor to handle 401 responses by redirecting to `/login`.

**Severity:** High — the entire app is non-functional in a secured backend environment.

### 5.4 No Input Validation Before Submission

Form values are passed directly from controlled inputs to API requests. No trimming, no length limits, no required-field checks. A user can submit empty or arbitrarily long values. This is partially a backend concern but the frontend should enforce basic constraints.

**Severity:** Medium.

---

## 6. Security Concerns

| Issue | Location | Severity |
|---|---|---|
| No HTTPS in API base URL | `src/api/http.ts` | Medium |
| No 401/403 response handling | `src/api/http.ts` | High |
| No token expiry / refresh logic | `AuthContext.tsx` | Medium |
| Auth state in plain React state (lost on refresh) | `AuthContext.tsx` | High |
| Form inputs not trimmed before submission | All form dialogs | Low |

For a TFG/portfolio project none of these are blockers, but the missing 401 interceptor is worth calling out because it means the frontend and backend auth layers are effectively disconnected.

---

## 7. Performance

### Concerns

**No pagination.** Every list loads all records. This will cause noticeable slowdowns with datasets past ~100 rows. Tables also re-render all rows on any state change because there is no `React.memo` or row-level memoization.

**Three charting libraries.** Chart.js (~200KB gzipped), Recharts (~140KB), and MUI X Charts (~80KB) combined represent roughly 400KB of extra JavaScript that could be reduced to ~140KB by picking one.

**No lazy loading of routes.** All pages are imported eagerly in `AppRouter.tsx`. With Vite this is a trivial fix:
```typescript
const ClientDevicesPage = React.lazy(() => import("../pages/client/ClientDevicesPage"));
// Wrap routes in <Suspense fallback={<Spinner />}>
```

**No memoization.** Large table components are not wrapped in `React.memo`. Filter and search state changes cause full re-renders.

### What's Fine

Tailwind CSS has zero runtime overhead. Vite's production build tree-shakes well. Lucide React is tree-shakeable. There are no N+1 request patterns on list pages.

---

## 8. Testing

**There are no tests in this project.** No unit tests, no integration tests, no E2E tests.

For a TFG this is common and not disqualifying. However for a portfolio piece presented to European employers — especially those hiring for Java roles where testing culture is strong — the absence of any tests is a flag.

The minimum viable addition: unit tests for the utility functions in `src/utils/` and at least one custom hook. Vitest is already compatible with Vite and requires minimal configuration.

```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

Adding even 5–10 meaningful tests changes the conversation in an interview from "I didn't write tests" to "I used Vitest to test the hook logic and utilities."

---

## 9. Dependency Audit

### Redundant / Should Remove

| Package | Issue | Recommendation |
|---|---|---|
| `chart.js` + `react-chartjs-2` | Duplicate charting capability | Remove; keep Recharts |
| `@mui/x-charts` | Third charting library | Remove; keep Recharts |
| `@heroicons/react` | Duplicate icon library | Remove; keep Lucide |

### Missing / Should Add

| Package | Why |
|---|---|
| `react-hook-form` | Form state and validation |
| `zod` | Schema validation for forms |
| `vitest` | Unit testing (zero extra config with Vite) |
| `@testing-library/react` | Component testing |

### Version Notes

- React 19.2.0 — very recent release. MUI 7 compatibility should be verified.
- TypeScript 5.9.3 — current, good.
- Vite 7.x — current, good.
- Axios 1.6.7 — minor version behind 1.7.x, but not a concern.

---

## 10. Prioritized Recommendations

### P0 — Fix Before Showing to Anyone

1. **Add `VITE_API_URL` env variable** to `src/api/http.ts` and add a `.env.example` file
2. **Persist auth state** in `AuthContext` using localStorage on login/logout
3. **Add Axios interceptors** — request interceptor for Bearer token, response interceptor for 401 → redirect to login
4. **Delete `*_OLD.tsx` files** and unused `Landing1Page`, `Landing2Page` from the repo
5. **Write a README.md** with project description, setup steps, and a screenshot

### P1 — Fix Before a Technical Interview

6. **Add client-side form validation** using `react-hook-form` + `zod` on at least one form dialog
7. **Standardize error handling** — create a shared error notification hook and use it consistently in all `.catch()` blocks
8. **Remove two of three charting libraries** — keep Recharts, remove `chart.js` and `@mui/x-charts`
9. **Remove one of two icon libraries** — keep Lucide, remove Heroicons
10. **Add route-level code splitting** via `React.lazy` + `Suspense` in `AppRouter.tsx`
11. **Add `aria-label`** to all icon-only buttons; add `scope="col"` to table headers

### P2 — Portfolio Polish

12. **Add Vitest + at least 5 unit tests** for utility functions and one custom hook
13. **Add pagination** to at least one list page as a demonstration
14. **Split oversized custom hooks** into fetch / selection / mutation layers
15. **Extract `drawerWidth`** and other duplicated constants to a shared `constants.ts`

### P3 — Long-term Completeness

16. Implement token refresh logic
17. Add Playwright E2E tests for happy-path flows
18. Add virtual scrolling for large lists (TanStack Virtual)
19. Replace manual fetch logic with React Query

---

## 11. Portfolio Assessment

**Target:** Junior developer, Java primary, React/TypeScript secondary. European job market.

### Overall Verdict: Good portfolio piece with two blockers to fix first

The project demonstrates real ability: it is not a tutorial clone, it has a real domain, real architecture decisions, and a professional visual result. A hiring manager looking at the GitHub repo will be impressed by the scope. A senior engineer doing a code review will find issues, but most are the normal gap between a demo and a production app — not signs of fundamental misunderstanding.

---

### What works in the candidate's favor

**Scope signals effort.** Two roles, full CRUD on three entities, dashboard with charts, dark mode, responsive design — this is not a weekend project.

**Architecture is sensible.** Layered API client, protected routing, context-based auth, custom hooks — these are real patterns, not cargo-culted code.

**TypeScript is genuine.** The types are meaningful, not just `any` everywhere. Model types mirror the backend contract. Optional chaining and nullish coalescing are used correctly.

**UI quality is high.** The project looks professional. European companies (especially German, Dutch, and Scandinavian) care about visual quality and polish in frontend portfolio pieces.

**Tech stack is current.** React 19, Vite 7, Tailwind 4, MUI 7 — this is not a stale Create React App project. Using Class Variance Authority for the Button component shows awareness of contemporary tooling beyond the obvious choices.

---

### What could hurt in a technical interview

These are the specific things an interviewer might probe on:

**1. F5 logs you out. (P0 — fix this first)**
If an interviewer runs the app, presses F5, and gets redirected to `/login`, the first question will be "why?". Not being able to answer confidently — or worse, not having noticed it — is a serious credibility hit for someone presenting the project as complete work.

**2. No tests. (Significant in the European market)**
German, Dutch, Scandinavian, and French tech companies tend to have strong testing cultures even for junior roles. "I didn't write tests because it's a student project" is understandable but weak. "I wrote unit tests for the hook logic with Vitest — here they are" changes the entire impression. Adding even 5–10 tests is worth the time.

**3. Three chart libraries in one project.**
Any engineer doing a dependency review (`cat package.json` or browsing GitHub) will notice this. The honest answer — "I experimented with different libraries and didn't clean up" — is forgivable, but it is better if it simply is not there.

**4. Dead `*_OLD.tsx` files.**
Small thing, but it signals that the candidate did not do a final pass before presenting. Professionalism shows in the details.

**5. No README.**
A GitHub repository without a README suggests the developer did not think about how others would encounter the project. A README with a screenshot, one paragraph of description, and setup steps is the minimum professional bar. This is also the first thing a recruiter sees.

**6. Hardcoded `localhost:8080`.**
If asked "how would you deploy this?", the candidate needs to be able to answer. The hardcoded URL is the most visible indicator that deployment was not considered. The fix is one line (one env variable), but having it unfixed in a portfolio is an unnecessary distraction.

---

### What does NOT matter for a junior Java developer's frontend portfolio

- No pagination (noted, not a dealbreaker for a demo — just be honest about it)
- No React Query or Redux (hooks-based state is a valid modern choice; be ready to explain the tradeoff)
- No perfect accessibility (mention it as a known gap, shows self-awareness)
- Some components being longer than ideal (junior-level, acceptable)

---

### Minimum checklist before sharing the repo link

- [ ] Auth persists on refresh (P0 #2)
- [ ] API base URL is an env variable (P0 #1)
- [ ] Axios auth interceptors in place (P0 #3)
- [ ] `_OLD` files and unused pages deleted (P0 #4)
- [ ] README.md with screenshot and setup steps (P0 #5)
- [ ] Redundant chart and icon libraries removed (P1 #8, #9)

With those six items done, this is a **strong secondary-skill portfolio piece**. The candidate can confidently present it as: *"A full-stack TFG project — Spring Boot backend, React/TypeScript frontend — demonstrating role-based CRUD, responsive design, and a layered API architecture"* without expecting hard pushback in a technical interview.

---

*Review based on full analysis of all source files in `src/`. All issues are based on observable patterns in the codebase, not speculation.*
