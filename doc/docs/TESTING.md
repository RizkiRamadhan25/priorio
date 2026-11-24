# Testing specification
All tests below are planned, NOT RUN. Use Vitest for domain/unit and real SQLite integration, Playwright Chromium for user-facing flows. Freeze injected clock; avoid sleeps and production DB. Test with Asia/Jakarta and America/New_York for DST, desktop 1440 and mobile 320/390, tablet 768 and desktop 1024. Test fixture DB generated in unique OS temp dir, use isolated port 3100; cleanup only fixture paths. Migrations applied from scratch, then seed. Capture actual command output and failures in .work/progress.md. No fake pass.

## Gates
- Unit: npm run test. Cover every urgency bucket, tie-break, date validity, normalization, filter, dashboard formulas, status transitions.
- Integration: npm run test:integration. Real adapter/database with migration; test CHECK/FK via direct safe test SQL, service validation, archive guard, duplicates, timestamps, persistence, rollback, seed rerun, DB path, concurrent mutations.
- E2E: npm run test:e2e. Use isolated app server, all CRUD, calendar, ranking, filter, preferences, keyboard and failure scenarios. Verify no full document reload on theme/language, no user draft loss, local-only requests. Test both locales/themes and 8 routes; no fake data in production.
- Quality: npm run lint, npm run typecheck, npm run build; test production start, local access, offline and backup restore. Record actual Node/npm and hardware.

## Acceptance cases (original IDs)
| ID | Expected verification |
|---|---|
| AC-001 | Create valid academic task and verify linked course |
| AC-002 | Create nonacademic task and verify category |
| AC-003 | Reject blank title |
| AC-004 | Reject deadline before assigned date |
| AC-005 | Reject level outside 0–5 |
| AC-006 | Reject fractional level |
| AC-007 | Reject missing required group |
| AC-008 | Reject both group references |
| AC-009 | Changing level recalculates score |
| AC-010 | Changing deadline recalculates rank |
| AC-011 | Completed task leaves priority |
| AC-012 | Reopen restores priority |
| AC-013 | Past deadline sets overdue |
| AC-014 | Delete requires confirmation |
| AC-015 | Reject deleting referenced course |
| AC-016 | Archive preserves existing tasks |
| AC-017 | Selecting calendar date lists corresponding tasks |
| AC-018 | Combined filters match all conditions |
| AC-019 | Dark theme affects all components |
| AC-020 | Language changes entire UI |
| AC-021 | Restart preserves records and preferences |
| AC-022 | 320px viewport no page horizontal overflow |
| AC-023 | Offline core works after installation |
| AC-024 | Storage failure preserves form and shows error |
| AC-025 | Empty DB shows valid empty dashboard |
| AC-026 | Script input renders as text |
| AC-027 | Duplicate normalized category rejected |
| AC-028 | Same day past deadline becomes overdue |
| AC-029 | Day rollover recalculates priority |
| AC-030 | Archived category task remains available |

## Priority cases
| ID | Expected verification |
|---|---|
| PE-01 | Overdue L5 -> 115 |
| PE-02 | Overdue L0 -> 100 |
| PE-03 | Today L5 -> 95 |
| PE-04 | Today L0 -> 80 |
| PE-05 | Tomorrow L5 -> 75 |
| PE-06 | Tomorrow L0 -> 60 |
| PE-07 | 2 days L4 -> 52 |
| PE-08 | 3 days L1 -> 43 |
| PE-09 | 4 days L3 -> 29 |
| PE-10 | 7 days L5 -> 35 |
| PE-11 | 8 days L5 -> 15 |
| PE-12 | 30 days L0 -> 0 |
| PE-13 | Completed excluded |
| PE-14 | Past explicit time today L3 -> 109 |
| PE-15 | Same score: earlier deadline wins |
| PE-16 | Same score/deadline: earlier created_at wins |
| PE-17 | All ties: ID ascending |
| PE-18 | Exact explicit deadline not overdue; 1 ms later overdue |
| PE-19 | No time: 23:59:59.999 local then overdue |
| PE-20 | Day difference across DST uses calendar not elapsed hours |
| PE-21 | Invalid level/date rejected before ranking |
| PE-22 | Across buckets high level never outranks higher urgency |
| PE-23 | Archived group active task ranks |
| PE-24 | Local midnight/focus/mutation refresh; no duplicate timers |

## Requirement-level test registry
Every V-ID is a required test assertion, not an already implemented test. Automated tests can cover multiple IDs; annotate test names or mapping and capture evidence for each. NFR manual checks are allowed where indicated; all core domain rules automated. For FR, create fixture with relevant records, perform named action in real UI/service, assert expected persisted/displayed result and reject invalid actions where relevant. For display requirements compare exact fixture values. For settings restart actual server. For quality checks use procedures below.
| Verification ID | Expected behavior | Suite | Task |
|---|---|---|---|
| V-FR-001 | Total task count | dashboard | T-11 |
| V-FR-002 | Active task count | dashboard | T-11 |
| V-FR-003 | To Do count | dashboard | T-11 |
| V-FR-004 | In Progress count | dashboard | T-11 |
| V-FR-005 | Completed count | dashboard | T-11 |
| V-FR-006 | Overdue count | dashboard | T-11 |
| V-FR-007 | Completion percentage | dashboard | T-11 |
| V-FR-008 | Top five priority tasks | dashboard | T-11 |
| V-FR-009 | Upcoming deadlines in 7-day window | dashboard | T-11 |
| V-FR-010 | Status distribution | dashboard | T-11 |
| V-FR-011 | Course/category distribution | dashboard | T-11 |
| V-FR-012 | Create task | tasks | T-08 |
| V-FR-013 | View task details | tasks | T-08 |
| V-FR-014 | Edit task | tasks | T-08 |
| V-FR-015 | Delete task | tasks | T-08 |
| V-FR-016 | Choose task type | tasks | T-08 |
| V-FR-017 | Choose course | tasks | T-08 |
| V-FR-018 | Choose category | tasks | T-08 |
| V-FR-019 | Set assigned date | tasks | T-08 |
| V-FR-020 | Set deadline date and optional time | tasks | T-08 |
| V-FR-021 | Set level 0–5 | tasks | T-08 |
| V-FR-022 | Change task status | tasks | T-08 |
| V-FR-023 | Mark task completed | tasks | T-08 |
| V-FR-024 | Reopen completed task | tasks | T-08 |
| V-FR-025 | Confirm deletion | tasks | T-08 |
| V-FR-026 | Persist changes | tasks | T-08 |
| V-FR-027 | Create course | courses | T-06 |
| V-FR-028 | Edit course | courses | T-06 |
| V-FR-029 | Choose course color | courses | T-06 |
| V-FR-030 | Archive course | courses | T-06 |
| V-FR-031 | Delete unreferenced course | courses | T-06 |
| V-FR-032 | Show course task count | courses | T-06 |
| V-FR-033 | View tasks by course | courses | T-06 |
| V-FR-034 | Restore archived course | courses | T-06 |
| V-FR-035 | Create category | categories | T-07 |
| V-FR-036 | Edit category | categories | T-07 |
| V-FR-037 | Choose category color | categories | T-07 |
| V-FR-038 | Delete unreferenced category | categories | T-07 |
| V-FR-039 | Archive category | categories | T-07 |
| V-FR-040 | Show category task count | categories | T-07 |
| V-FR-041 | Restore archived category | categories | T-07 |
| V-FR-042 | Monthly calendar | calendar | T-12 |
| V-FR-043 | Navigate month/year | calendar | T-12 |
| V-FR-044 | Show due date indicators | calendar | T-12 |
| V-FR-045 | Select date to list tasks | calendar | T-12 |
| V-FR-046 | Use group colors | calendar | T-12 |
| V-FR-047 | Highlight today | calendar | T-12 |
| V-FR-048 | Open task detail | calendar | T-12 |
| V-FR-049 | Create task with selected deadline | calendar | T-12 |
| V-FR-050 | Filter active/completed tasks | calendar | T-12 |
| V-FR-051 | List completed tasks | completed | T-13 |
| V-FR-052 | Show completion date | completed | T-13 |
| V-FR-053 | Search completed tasks | completed | T-13 |
| V-FR-054 | Filter by course/category | completed | T-13 |
| V-FR-055 | Reopen task | completed | T-13 |
| V-FR-056 | View/edit task details | completed | T-13 |
| V-FR-057 | Delete with confirmation | completed | T-13 |
| V-FR-058 | Search title | search | T-10 |
| V-FR-059 | Search description | search | T-10 |
| V-FR-060 | Filter task type | search | T-10 |
| V-FR-061 | Filter course | search | T-10 |
| V-FR-062 | Filter category | search | T-10 |
| V-FR-063 | Filter level | search | T-10 |
| V-FR-064 | Filter status | search | T-10 |
| V-FR-065 | Filter deadline condition | search | T-10 |
| V-FR-066 | Sort priority | search | T-10 |
| V-FR-067 | Sort deadline | search | T-10 |
| V-FR-068 | Sort difficulty | search | T-10 |
| V-FR-069 | Sort created date | search | T-10 |
| V-FR-070 | Sort title | search | T-10 |
| V-FR-071 | Clear all filters | search | T-10 |
| V-FR-072 | Change theme | settings | T-14 |
| V-FR-073 | Change language | settings | T-14 |
| V-FR-074 | Persist sidebar preference | settings | T-14 |
| V-FR-075 | Restore preferences after restart | settings | T-14 |
| V-FR-076 | Show app version | settings | T-14 |
| V-FR-077 | Show database path | settings | T-14 |
| V-FR-078 | Light mode | theme | T-14 |
| V-FR-079 | Dark mode | theme | T-14 |
| V-FR-080 | Switch without full reload | theme | T-14 |
| V-FR-081 | Persist theme | theme | T-14 |
| V-FR-082 | All components support both themes | theme | T-14 |
| V-FR-083 | Indonesian UI | i18n | T-14 |
| V-FR-084 | English UI | i18n | T-14 |
| V-FR-085 | Switch without full reload | i18n | T-14 |
| V-FR-086 | Translate all UI text | i18n | T-14 |
| V-FR-087 | Locale-specific date/month | i18n | T-14 |
| V-FR-088 | Localized validation and toast | i18n | T-14 |
| V-FR-089 | Persist language | i18n | T-14 |
| V-FR-090 | Store data locally | database | T-04 |
| V-FR-091 | Persist on restart | database | T-04 |
| V-FR-092 | Initialize database | database | T-04 |
| V-FR-093 | Support migrations | database | T-04 |
| V-FR-094 | Validate relationships | database | T-04 |
| V-FR-095 | Restrict referenced deletion | database | T-04 |
| V-FR-096 | Report persistence failures | database | T-04 |
| V-NFR-001 | Dashboard warm load target <=2 s | quality | T-18 |
| V-NFR-002 | Task save target <=500 ms | quality | T-18 |
| V-NFR-003 | Rank 1000 tasks <=200 ms | quality | T-18 |
| V-NFR-004 | No full reload on theme/language | quality | T-18 |
| V-NFR-005 | Usable with 5000 tasks | quality | T-18 |
| V-NFR-006 | Easy access to new task action | quality | T-15 |
| V-NFR-007 | Consistent navigation | quality | T-15 |
| V-NFR-008 | Empty state | quality | T-15 |
| V-NFR-009 | Loading state | quality | T-15 |
| V-NFR-010 | Success/error feedback | quality | T-15 |
| V-NFR-011 | Confirm destructive actions | quality | T-15 |
| V-NFR-012 | Usable without tutorial | quality | T-15 |
| V-NFR-013 | Default server loopback | quality | T-16 |
| V-NFR-014 | No external data transmission | quality | T-16 |
| V-NFR-015 | Server-side validation | quality | T-16 |
| V-NFR-016 | Prevent SQL injection | quality | T-16 |
| V-NFR-017 | Escape user HTML/script | quality | T-16 |
| V-NFR-018 | Database outside public | quality | T-16 |
| V-NFR-019 | Do not commit private database | quality | T-16 |
| V-NFR-020 | No external telemetry | quality | T-16 |
| V-NFR-021 | Protect mutations against cross-origin requests | quality | T-16 |
| V-NFR-022 | Keyboard controls | quality | T-15 |
| V-NFR-023 | Input labels | quality | T-15 |
| V-NFR-024 | Modal focus management and Escape | quality | T-15 |
| V-NFR-025 | Color not sole indicator | quality | T-15 |
| V-NFR-026 | Normal text contrast >=4.5:1 | quality | T-15 |
| V-NFR-027 | Visible focus state | quality | T-15 |
| V-NFR-028 | Respect reduced motion | quality | T-15 |
| V-NFR-029 | TypeScript strict | quality | T-03 |
| V-NFR-030 | Separate UI and domain logic | quality | T-03 |
| V-NFR-031 | Reusable components | quality | T-03 |
| V-NFR-032 | Pure independently tested priority engine | quality | T-09 |
| V-NFR-033 | Modular folders | quality | T-03 |
| V-NFR-034 | Install documentation | quality | T-19 |
| V-NFR-035 | Unit tests for business rules | quality | T-17 |
| V-NFR-036 | E2E tests for critical flows | quality | T-17 |
| V-PE-R01 | Dynamic ranking and tie-breaks | priority | T-09 |
| V-PE-R02 | Refresh at boundaries and changes | priority | T-09 |
| V-PE-R03 | Full ranking explanation | priority | T-10 |

## Detailed fixture and negative cases
- Dataset: one course C1 with todo L5 due tomorrow, progress L0 due today, completed L2 due yesterday; category G1 with overdue L3, active L4 due in 3 days. Expected total 5, active 4, completed 1 (20%), todo/progress per fixture assignment, overdue 1, rank overdue -> today -> tomorrow -> 3 days. Upcoming today/tomorrow/3 days; completed excluded. Archive C1: counts/rank unchanged; no new task assigned there; existing task title edit works. Deleting either referenced group rejected. Remove all links then deletion succeeds. Empty DB counts 0 and percentage 0.
- Task validations: whitespace title, max and max+1 characters, invalid date 2026-02-30, leap date, invalid 24:00, 00:00, numeric string vs integer level, both/wrong/missing FK, unknown status, missing ID, archived assignment, invalid color. Direct DB negative tests for CHECKs and FK. Completed timestamp preserved on edits and reset on reopen; completed filter/history stable. Duplicate names with spaces/case/NFKC rejected in each table; seed rerun after default delete does not resurrect.
- Search: case-insensitive title/description, Unicode normalization, no match, multiple fields AND, values within field OR, archived group filter, all sort directions and stable ties. Priority page ignores arbitrary sort; filtering preserves global rank. Calendar prev/next December to January, February leap, Monday-start, today, date selection, add past date uses valid initial assigned, explicit time and no-time tasks sorted; archived colors remain.
- UI: save disabled while pending; injected storage error keeps modal draft, no success toast; cancel/delete confirmation, focus trap/return, Escape, keyboard navigation, aria labels, readable text at zoom, reduced motion, contrast sample computed for all semantic tokens. Verify ID/EN key parity, no hardcoded strings, localized validation/aria and HTML lang, no reload, settings persisted. Mobile drawer closes and desktop preference remains.
- Security: same-origin action succeeds, cross-origin/invalid Host/missing Origin fails; attempt DB URL/static traversal fails; script payload not executed, SQL metacharacters inert; listener only loopback; no outbound network on core flows; no secrets/DB tracked. Verify with DevTools/Playwright request capture and OS listener inspection. Backup/restore isolated stopped fixture and integrity_check, verify counts and settings. No live user DB.

## Performance acceptance
Target after production build on target laptop, no other heavy load, record OS/CPU/RAM/Node, SQLite dataset and timestamps. Dashboard warm page navigation to meaningful rendered content <=2s p95 (20 measured runs after 5 warmups); task save click to confirmed render <=500ms p95 (20 runs); pure rank 1000 fixture tasks <=200ms p95 (30 runs after warmup); 5000 tasks search/rank/calendar remain usable with no crash/overflow, report p95 and memory, paginate lists if needed while keeping global sorting/filter results. Theme/locale switch no full page reload. Targets not yet benchmarked; failure must be reported and fixed or explicit user-approved exception before release.

## Release evidence
Test IDs linked to actual test files and output; update statuses in TRACEABILITY only with evidence. Document manual steps/results and screenshots where helpful. Run all gates on clean installation, offline after setup, production restart persistence, backup/restore. No critical bugs or known integrity/security issues; release blocked if any required case not passed unless user explicitly accepts documented noncritical exception.
