# PRD — Priorio V1.0
## Product
Personal task manager for students and general users. Success: quickly capture tasks and identify what to work on next; track deadline and progress without external services. Single-user local web app, no login. Tagline: Know what to do next.

## Scope
Eight routes: /, /tasks, /priority, /courses, /categories, /calendar, /completed, /settings. All requirements below are must-have unless explicitly marked future. No notifications, attachments, subtasks, recurring tasks, estimates, Pomodoro, Kanban, semester management, manual ranking, AI, public deployment, auth, multi-user, collaboration, import/export UI, cloud or Google Calendar integration. No production demo records.

## Functional requirements (stable IDs from original PRD)
| ID | Requirement | Task |
|---|---|---|
| FR-001 | Total task count | T-11 |
| FR-002 | Active task count | T-11 |
| FR-003 | To Do count | T-11 |
| FR-004 | In Progress count | T-11 |
| FR-005 | Completed count | T-11 |
| FR-006 | Overdue count | T-11 |
| FR-007 | Completion percentage | T-11 |
| FR-008 | Top five priority tasks | T-11 |
| FR-009 | Upcoming deadlines in 7-day window | T-11 |
| FR-010 | Status distribution | T-11 |
| FR-011 | Course/category distribution | T-11 |
| FR-012 | Create task | T-08 |
| FR-013 | View task details | T-08 |
| FR-014 | Edit task | T-08 |
| FR-015 | Delete task | T-08 |
| FR-016 | Choose task type | T-08 |
| FR-017 | Choose course | T-08 |
| FR-018 | Choose category | T-08 |
| FR-019 | Set assigned date | T-08 |
| FR-020 | Set deadline date and optional time | T-08 |
| FR-021 | Set level 0–5 | T-08 |
| FR-022 | Change task status | T-08 |
| FR-023 | Mark task completed | T-08 |
| FR-024 | Reopen completed task | T-08 |
| FR-025 | Confirm deletion | T-08 |
| FR-026 | Persist changes | T-08 |
| FR-027 | Create course | T-06 |
| FR-028 | Edit course | T-06 |
| FR-029 | Choose course color | T-06 |
| FR-030 | Archive course | T-06 |
| FR-031 | Delete unreferenced course | T-06 |
| FR-032 | Show course task count | T-06 |
| FR-033 | View tasks by course | T-06 |
| FR-034 | Restore archived course | T-06 |
| FR-035 | Create category | T-07 |
| FR-036 | Edit category | T-07 |
| FR-037 | Choose category color | T-07 |
| FR-038 | Delete unreferenced category | T-07 |
| FR-039 | Archive category | T-07 |
| FR-040 | Show category task count | T-07 |
| FR-041 | Restore archived category | T-07 |
| FR-042 | Monthly calendar | T-12 |
| FR-043 | Navigate month/year | T-12 |
| FR-044 | Show due date indicators | T-12 |
| FR-045 | Select date to list tasks | T-12 |
| FR-046 | Use group colors | T-12 |
| FR-047 | Highlight today | T-12 |
| FR-048 | Open task detail | T-12 |
| FR-049 | Create task with selected deadline | T-12 |
| FR-050 | Filter active/completed tasks | T-12 |
| FR-051 | List completed tasks | T-13 |
| FR-052 | Show completion date | T-13 |
| FR-053 | Search completed tasks | T-13 |
| FR-054 | Filter by course/category | T-13 |
| FR-055 | Reopen task | T-13 |
| FR-056 | View/edit task details | T-13 |
| FR-057 | Delete with confirmation | T-13 |
| FR-058 | Search title | T-10 |
| FR-059 | Search description | T-10 |
| FR-060 | Filter task type | T-10 |
| FR-061 | Filter course | T-10 |
| FR-062 | Filter category | T-10 |
| FR-063 | Filter level | T-10 |
| FR-064 | Filter status | T-10 |
| FR-065 | Filter deadline condition | T-10 |
| FR-066 | Sort priority | T-10 |
| FR-067 | Sort deadline | T-10 |
| FR-068 | Sort difficulty | T-10 |
| FR-069 | Sort created date | T-10 |
| FR-070 | Sort title | T-10 |
| FR-071 | Clear all filters | T-10 |
| FR-072 | Change theme | T-14 |
| FR-073 | Change language | T-14 |
| FR-074 | Persist sidebar preference | T-14 |
| FR-075 | Restore preferences after restart | T-14 |
| FR-076 | Show app version | T-14 |
| FR-077 | Show database path | T-14 |
| FR-078 | Light mode | T-14 |
| FR-079 | Dark mode | T-14 |
| FR-080 | Switch without full reload | T-14 |
| FR-081 | Persist theme | T-14 |
| FR-082 | All components support both themes | T-14 |
| FR-083 | Indonesian UI | T-14 |
| FR-084 | English UI | T-14 |
| FR-085 | Switch without full reload | T-14 |
| FR-086 | Translate all UI text | T-14 |
| FR-087 | Locale-specific date/month | T-14 |
| FR-088 | Localized validation and toast | T-14 |
| FR-089 | Persist language | T-14 |
| FR-090 | Store data locally | T-04 |
| FR-091 | Persist on restart | T-04 |
| FR-092 | Initialize database | T-04 |
| FR-093 | Support migrations | T-04 |
| FR-094 | Validate relationships | T-04 |
| FR-095 | Restrict referenced deletion | T-04 |
| FR-096 | Report persistence failures | T-04 |

## Priority module (additional explicit requirements)
| ID | Requirement | Task |
|---|---|---|
| PE-R01 | Rank active tasks by dynamic score and tie-break rules | T-09 |
| PE-R02 | Recompute on mutation, route entry, focus, local day and deadline boundaries | T-09 |
| PE-R03 | Show full ranking and localized explanation on /priority | T-10 |

## Nonfunctional requirements
| ID | Requirement | Task |
|---|---|---|
| NFR-001 | Dashboard warm load target <=2 s | T-18 |
| NFR-002 | Task save target <=500 ms | T-18 |
| NFR-003 | Rank 1000 tasks <=200 ms | T-18 |
| NFR-004 | No full reload on theme/language | T-18 |
| NFR-005 | Usable with 5000 tasks | T-18 |
| NFR-006 | Easy access to new task action | T-15 |
| NFR-007 | Consistent navigation | T-15 |
| NFR-008 | Empty state | T-15 |
| NFR-009 | Loading state | T-15 |
| NFR-010 | Success/error feedback | T-15 |
| NFR-011 | Confirm destructive actions | T-15 |
| NFR-012 | Usable without tutorial | T-15 |
| NFR-013 | Default server loopback | T-16 |
| NFR-014 | No external data transmission | T-16 |
| NFR-015 | Server-side validation | T-16 |
| NFR-016 | Prevent SQL injection | T-16 |
| NFR-017 | Escape user HTML/script | T-16 |
| NFR-018 | Database outside public | T-16 |
| NFR-019 | Do not commit private database | T-16 |
| NFR-020 | No external telemetry | T-16 |
| NFR-021 | Protect mutations against cross-origin requests | T-16 |
| NFR-022 | Keyboard controls | T-15 |
| NFR-023 | Input labels | T-15 |
| NFR-024 | Modal focus management and Escape | T-15 |
| NFR-025 | Color not sole indicator | T-15 |
| NFR-026 | Normal text contrast >=4.5:1 | T-15 |
| NFR-027 | Visible focus state | T-15 |
| NFR-028 | Respect reduced motion | T-15 |
| NFR-029 | TypeScript strict | T-03 |
| NFR-030 | Separate UI and domain logic | T-03 |
| NFR-031 | Reusable components | T-03 |
| NFR-032 | Pure independently tested priority engine | T-09 |
| NFR-033 | Modular folders | T-03 |
| NFR-034 | Install documentation | T-19 |
| NFR-035 | Unit tests for business rules | T-17 |
| NFR-036 | E2E tests for critical flows | T-17 |

## Business rules
- BR-001/002: only TODO and IN_PROGRESS rank; COMPLETED excluded.
- BR-003/004: urgency dominates; difficulty adds 3*level.
- BR-005/006/007: dynamic score, recompute when deadline or level changes.
- BR-008/009: completion removes, reopening reinserts.
- BR-010: overdue highest urgency.
- BR-011: score never persisted.
- BR-012: archived group tasks still count and rank if active.
- BR-013: host-local timezone. BR-014: no time means end of local day. BR-015: calendar day difference, not floor elapsed hours/24.

### Formula
U = 100 overdue, 80 today, 60 tomorrow, 40 in 2–3 calendar days, 20 in 4–7 days, 0 beyond 7. P = U + 3L, L integer 0..5. Max 115. Labels by urgency bucket: Overdue/Terlambat, Critical/Sangat Mendesak, High/Prioritas Tinggi, Medium/Prioritas Menengah, Normal/Prioritas Normal, Low/Prioritas Rendah. Higher level can outrank an earlier deadline within same bucket, never across buckets. Overdue tasks also sorted by score. Sort P desc, effective deadline asc, created_at asc, id asc. Show reason: due relative label + level; score on priority page.

### Task workflow
Title 1–150 trimmed; description <=5000, notes <=2000; type academic/nonacademic exactly one matching group FK; assigned date required and <= due date; valid calendar dates; optional HH:mm; past due accepted; level integer 0–5; status TODO, IN_PROGRESS, COMPLETED. Any distinct status transition allowed. Completed_at set when entering Completed, cleared on leaving, preserved when editing completed. Delete permanently only after confirmation. Retain form and show errors on failure. No optimistic success before commit.

### Groups and settings
Course name 1–100, code <=30, lecturer <=100. Category name 1–100, description <=500. Group unique normalized name within type, color valid #RRGGBB or approved palette. Archive/restore; cannot delete referenced group. Archived groups not available for new assignment, existing associations remain valid. Settings singleton default Light, ID, expanded sidebar. Locale routes unchanged; UI text only translated. Calendar Monday-start month grid by due date; selected day list sorted due time then id; active and completed filters; add task prefilled with selected deadline. If past date selected, assigned date defaults to selected date to prevent invalid initial form. Dashboard counts all tasks; active = TODO+IN_PROGRESS; overdue subset of active; completion = completed/total*100 rounded 1 decimal, zero if empty. Upcoming active non-overdue today through today+6 days inclusive. Distribution includes archived groups. See DECISIONS for defaults.

## Acceptance and release
All FR/NFR and PE-R IDs mapped to tasks/tests in TRACEABILITY.csv. See TESTING for original AC-001..030, priority test cases, edge cases and performance conditions. Release requires actual passing tests, build, fresh install, restart persistence, offline use, backup restore, no critical bugs, docs, and explicit review of unresolved risks. No implementation evidence exists in this package.
