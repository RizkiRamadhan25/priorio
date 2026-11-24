# System architecture
## Runtime / dependency baseline
Monolith Next.js App Router with Node runtime, local SQLite, no remote APIs. Node 22 LTS >=22.12 within major 22, npm bundled compatible. Next.js 16.x / React 19.x / react-dom matching, TypeScript 5.x strict, Tailwind 4.x, Prisma CLI/client/adapter-better-sqlite3 7.x matching exact patch where available, better-sqlite3 native dependency; shadcn/ui (vendored components), Lucide, Zod 4, React Hook Form 7 and compatible resolvers, Recharts 3, next-intl 4, next-themes 0.4, Vitest and Playwright stable compatible versions, ESLint compatible Next 16. These are intended majors, not verified exact installs. T-02 resolves compatible patches, checks actual engine/peer requirements, pins direct dependencies exactly, commits package-lock.json and documents actual Node/npm/versions in `.work/environment.md` and README. No prerelease, no --force/--legacy-peer-deps. If chosen major incompatible, stop and record proposed smallest change before proceeding. Prisma 7 config filename/API may vary by patch: follow matching installed docs and test CLI/runtime paths. Native adapter must pass actual CRUD on Windows or target OS.

References checked for approach (not runtime proof): https://nextjs.org/docs/app/getting-started/installation ; https://www.prisma.io/docs/v7/prisma-orm/quickstart/sqlite ; https://next-intl.dev/docs/routing/configuration . Next 16 build does not implicitly lint; use explicit ESLint. Prisma 7 SQLite driver adapter required by this baseline.

## Layers
Browser UI -> Server Actions -> Zod validation -> domain services -> repositories (Prisma adapter) -> SQLite. Server Components for initial reads, Client Components for dialogs, interactive filtering/clock, settings/calendar. Use `server-only` boundary for database and env. Node runtime, not Edge/static export. No separate REST API unless required by test/security; avoid unnecessary endpoints. Mutations return typed discriminated result `{ok:true,data}` or `{ok:false,code,fieldErrors?}`; UI translates code, never expose raw SQL/error. Catch known unique, FK, validation, not-found, archived, storage and origin errors. Log concise local diagnostic without user content or secrets. Use one transaction for multi-step mutations; revalidate affected routes. Avoid static caching of live data; route refresh after mutation, focus and clock boundaries as needed. Avoid multiple DB clients in dev HMR. Prevent concurrent duplicate form submissions.

## Folder contract
```text
src/app/(workspace)/{page.tsx,tasks,priority,courses,categories,calendar,completed,settings}/
src/app/layout.tsx
src/components/{ui,shell,tasks,groups,dashboard,calendar,settings,shared}/
src/domain/{task,group,priority,calendar,search,statistics,settings}/
src/server/{actions,services,repositories,db,security}/
src/lib/{dates,validation,env}/
src/i18n/{request.ts,messages/id.json,messages/en.json}/
prisma/{schema.prisma,migrations/,seed.ts}
scripts/
tests/{unit,integration,e2e,fixtures}/
data/.gitkeep
```
Keep docs at root as provided. Choose actual config file for Prisma installed patch. No route locale prefix; next-intl locale loaded from DB, use provider refresh when locale changes; route and draft preserved; client context updated without document reload. next-themes controlled mirror of DB theme, reconcile initial preference and avoid hydration mismatch. Fonts/assets bundled offline.

## Domain contracts
- TaskService list/get/create/update/changeStatus/remove; inputs Zod; server timestamps/id, exact XOR, archive guard. Status transition transactional; not-found if missing. Return safe DTO including group metadata, no persistent priority. GroupService list/create/update/archive/restore/remove, count and linked tasks. SettingsService get/update (singleton). Dashboard aggregate from same dataset snapshot as priority and deadline rules. CalendarService month/day range by local due date; group filters. No API endpoints for DB file.
- Priority `rankTasks(tasks, now, zone)` pure, excludes completed. Date helper builds effective deadline from local date + time or end day; explicit time seconds=0. `now > deadline` overdue; equality not overdue. Calendar-day diff using date components, not elapsed duration; DST as DECISIONS. Score U+3L; tie due instant then created instant then stable string ID. `getPriority` returns score/label/overdue/reason; completed returns null. Inject clock and timezone; test without sleeping. Use host timezone from Node Intl, pass to client; production client same host. Recalculate when deadline crossed, midnight, mutation, navigation, focus; schedule next boundary (or minute check plus exact next deadline), cap delays and reschedule on visibility; never persist score. Use consistent now per aggregate.
- `searchTasks` normalized substring OR title/description; AND filters across fields, OR selected values within field. Deadline filter overdue/today/tomorrow/2–3/4–7/>7, completed due filters by date bucket but not overdue. Default active score sort, completed last with due asc/created/id; alternate sort asc/desc with deterministic ties; title locale-insensitive normalized ordering then id. Priority page fixed rank, filtered original positions. Completed newest completed_at desc, id asc. Dates as ISO local date, UTC timestamps separate.

## Commands (package.json contract)
| Script | Meaning |
|---|---|
| dev | Next dev --hostname 127.0.0.1 --port 3000; telemetry disabled |
| start | Next start --hostname 127.0.0.1 --port 3000; telemetry disabled |
| build | Next build; no external assets/network required after install; dynamic DB pages not prerendered |
| lint | eslint . |
| typecheck | tsc --noEmit (generate Next types first if needed) |
| test | vitest run unit suite |
| test:integration | vitest run integration suite against temp DB |
| test:e2e | playwright test (isolated server and DB; use loopback test port) |
| db:generate | prisma generate |
| db:migrate | prisma migrate deploy (ensure data parent and env) |
| db:migrate:dev | prisma migrate dev (dev DB only) |
| db:seed | run idempotent seed (Prisma db seed or pinned TS runner) |
| check | lint, typecheck, test, test:integration, build sequentially |
Use portable Node wrapper where env/paths require it (Windows PowerShell support). Telemetry disabled for all Next scripts, not only env file. `npm ci` after lock created. Playwright browser install once via `npx playwright install chromium` (and dependencies where needed); test offline after. No secrets needed. DATABASE_URL and NEXT_TELEMETRY_DISABLED only in .env.example. Tests must override DATABASE_URL before importing DB modules; use temp DB and test server port e.g. 3100, no user DB. `npm run build` must succeed from clean installed repo with initialized DB or documented init; do not create records during build.
