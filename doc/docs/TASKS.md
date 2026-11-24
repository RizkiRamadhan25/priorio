# Implementation plan & task breakdown
Execute topologically. Default one task at a time; no feature implementation before T-02 passes. All statuses initially NOT_STARTED. Tests and security are incremental, not postponed to end. Record files/commands/exit codes/requirement IDs and blockers in `.work/progress.md` after each task. Requirement/test mapping is TRACEABILITY.csv; T-17 closes all missing coverage.

| Task | Work | Dependencies | Completion gate |
|---|---|---|---|
| T-01 | Inventory existing repo and documentation; do not overwrite user work; check node/npm/git, OS and writable workspace. Record conflicts and environment evidence. | None | Documented inventory, no destructive actions |
| T-02 | Scaffold disposable compatibility probe; resolve/pin deps, verify Prisma generate, migration with checks, FK enforcement, CRUD, CLI/runtime same path, Next production build and Playwright install/run. Record versions and commands; then initialize actual scaffold. | T-01 | Actual successful probe and lockfile; blocker stops feature coding |
| T-03 | Foundation: strict TS, lint, layers, scripts, app shell skeleton, tokens, test config, no remote assets. | T-02 | Lint/typecheck/build pass; reusable shell |
| T-04 | Schema migration, constraints, indexes, DB adapter, environment/path resolver, singleton and seed, error mapping. | T-03 | DB tests, restart, seed idempotence, foreign keys and checks |
| T-05 | Domain validation, date/time utilities, normalization, statuses, DTO/error contracts, transaction helpers. | T-04 | Unit tests invalid inputs, UTC/local date boundaries |
| T-06 | Course service/actions/UI CRUD archive restore count and linked tasks. | T-05 | Course CRUD, referenced restriction, archive guard |
| T-07 | Category service/actions/UI CRUD archive restore seed/count. | T-05 | Category CRUD, duplicate check and archive guard |
| T-08 | Task service/actions/modal/details CRUD and lifecycle; persistent commit; failure states. | T-06,T-07 | AC-001..008,011,012,014,024; service and E2E coverage |
| T-09 | Pure priority engine, stable ranking, labels, shared deadline helpers and refresh scheduler. | T-08 | PE-01..24 and boundary integration |
| T-10 | All Tasks and Priority pages, search filters sorting, ranking explanation. | T-09 | All search and filter tests, fixed rank and tie-breaks |
| T-11 | Dashboard metrics, distribution, top five and upcoming deadlines. | T-10 | Counts reconcile, zero-data, upcoming boundaries |
| T-12 | Monthly calendar, navigation, selected day, prefilled modal and filters. | T-08,T-09 | Calendar leap/rollover and deadline consistency |
| T-13 | Completed page with newest first, search/filter, reopen, edit/delete. | T-10 | Completed lifecycle, timestamp, restart |
| T-14 | Theme, bilingual dictionaries, settings service/persistence, sidebar preference and app metadata. | T-03,T-04,T-11,T-12,T-13 | All pages both themes/languages, no reload/draft loss |
| T-15 | Responsive polish, keyboard accessibility, error/empty/loading states, contrast, motion. | T-14 | 320–1440 widths, keyboard, accessible modal and contrast checks |
| T-16 | Security/privacy hardening, origin/host checks, offline, gitignore, DB protection. Baseline controls must already exist from T-03. | T-15 | Security tests pass; no external requests, no public DB |
| T-17 | Complete unit/integration/E2E suite; close coverage gaps across TRACEABILITY. | T-16 | All mapped functional/quality tests and AC/PE pass |
| T-18 | Benchmark warm dashboard/save/ranking, 5000 record stress; optimize only if needed. | T-17 | Report hardware, dataset, measured p95, targets; unresolved failures documented |
| T-19 | Finalize install/use/backup/restore docs, clean installation and production restart on target OS. | T-18 | Fresh install and verified restore, no sample task data |
| T-20 | Release audit: all requirements, scripts, test logs, security, offline, performance, git status, version/changelog. | T-19 | All gates pass or explicitly block release; tag only with user approval |

## Traceability by task
- T-01: Foundation or cross-cutting release gate; see completion gate above.
- T-02: Foundation or cross-cutting release gate; see completion gate above.
- T-03: NFR-029, NFR-030, NFR-031, NFR-033
- T-04: FR-090, FR-091, FR-092, FR-093, FR-094, FR-095, FR-096
- T-05: Foundation or cross-cutting release gate; see completion gate above.
- T-06: FR-027, FR-028, FR-029, FR-030, FR-031, FR-032, FR-033, FR-034
- T-07: FR-035, FR-036, FR-037, FR-038, FR-039, FR-040, FR-041
- T-08: FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019, FR-020, FR-021, FR-022, FR-023, FR-024, FR-025, FR-026
- T-09: NFR-032, PE-R01, PE-R02
- T-10: FR-058, FR-059, FR-060, FR-061, FR-062, FR-063, FR-064, FR-065, FR-066, FR-067, FR-068, FR-069, FR-070, FR-071, PE-R03
- T-11: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011
- T-12: FR-042, FR-043, FR-044, FR-045, FR-046, FR-047, FR-048, FR-049, FR-050
- T-13: FR-051, FR-052, FR-053, FR-054, FR-055, FR-056, FR-057
- T-14: FR-072, FR-073, FR-074, FR-075, FR-076, FR-077, FR-078, FR-079, FR-080, FR-081, FR-082, FR-083, FR-084, FR-085, FR-086, FR-087, FR-088, FR-089
- T-15: NFR-006, NFR-007, NFR-008, NFR-009, NFR-010, NFR-011, NFR-012, NFR-022, NFR-023, NFR-024, NFR-025, NFR-026, NFR-027, NFR-028
- T-16: NFR-013, NFR-014, NFR-015, NFR-016, NFR-017, NFR-018, NFR-019, NFR-020, NFR-021
- T-17: NFR-035, NFR-036
- T-18: NFR-001, NFR-002, NFR-003, NFR-004, NFR-005
- T-19: NFR-034
- T-20: Foundation or cross-cutting release gate; see completion gate above.

## Gate protocol
Before task: inspect prior work, verify dependencies, read related docs/IDs, state files and tests. After task: lint/typecheck plus relevant tests, inspect git diff and check no personal DB changes, report status. Do not claim pass from static review. T-02 may require internet/npm/Playwright browser download and native compiler depending on adapter support; no forced installs or destructive commands. T-20 requires all tests/build and documented release checks; no actual deployment.
