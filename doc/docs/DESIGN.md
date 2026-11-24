# UI/UX design specification
## Direction
Quiet productivity tool, restrained editorial typography, simple lists and hierarchy; no generic gradient hero, glassmorphism, oversized cards, decorative charts or excessive shadows. Desktop first, responsive down to 320px. Use locally bundled Inter (licensed) or native system fallback, no remote font calls. Wordmark Priorio, simple layered/checklist mark. Final brand assets not required for V1.

## Tokens
CSS variables with semantic names; apply Tailwind mappings. Values below are hex light / dark.
| Token | Light | Dark |
|---|---|---|
| background | #F6F7FA | #111318 |
| surface | #FFFFFF | #191C23 |
| surface-muted | #EEF0F5 | #222630 |
| text | #171923 | #F2F3F7 |
| text-muted | #555E70 | #AAB2C2 |
| border | #D9DDE6 | #353B48 |
| primary | #4F46E5 | #A5B4FC |
| primary-foreground | #FFFFFF | #171923 |
| success | #166534 | #86EFAC |
| warning | #92400E | #FCD34D |
| danger | #B91C1C | #FCA5A5 |
| info | #1D4ED8 | #93C5FD |
| focus | #4F46E5 | #A5B4FC |
Use semantic foreground on tinted backgrounds only after contrast check; group color as dot, never sole label or text. Difficulty levels 0–5 display L0..L5 and localized label, use success/neutral/amber/danger cues; priority labels separate from difficulty. No color-only information.
Spacing 4/8/12/16/20/24/32/40/48; radius 6/8/12; input/button min height 40 desktop, touch target 44 mobile; normal text 14–16, caption 12–13, section 18, page 26–30, metric 28–32; line height 1.5. Font weights 400/500/600/700. Focus outline 2px + offset 2. Transition 120–200ms; reduce motion disables nonessential animation.

## Shell / responsive
Desktop >=1024: sidebar 248px expanded, 64px collapsed, topbar 56–64px, content max 1440px with 24–32px padding. Sidebar primary navigation Dashboard, All Tasks, Priority, Courses, Categories, Calendar, Completed; Settings at bottom. Active link has semantic accent, collapsed icon has tooltip and accessible name. Topbar has page breadcrumb, theme toggle, language toggle, New Task. Tablet 768–1023: compact rail (temporary layout, do not overwrite desktop pref), content 16–24px. Mobile 320–767: no fixed rail; hamburger opens modal drawer, closes on navigation/Escape; stacked content, 16px margin; task list becomes cards, calendar uses dots/count and selected-day list. No page horizontal overflow; internal table scroll only if unavoidable. Modal width 560–640px desktop, mobile full width with safe margins, vertical scroll and sticky footer. Modal focus trap, focus return, ESC; if dirty ask discard confirmation; destructive confirm independent.

## Page layouts (wireframe specification)
| Route | Header / actions | Main content | Empty state |
|---|---|---|---|
| / | Overview, New Task | 4 metrics total/active/completed/overdue; completion bar; status distribution incl todo/in progress; top 5 priority; upcoming 7 days; group distribution | Zero metrics, add task/course CTA |
| /tasks | All Tasks, New Task | Search, filters, sort, result count; rows title/group, due, level, status, priority, actions; click detail | No tasks or no matching results + clear filters |
| /priority | Priority, explanation | Active ranking, ordinal, score, urgency reason, level, deadline, status; filter with global rank preserved | All caught up; add task |
| /courses | Courses, Add Course | Compact list/grid: color dot, name, code, lecturer, active/total, progress; archived toggle, actions, click tasks | Add course |
| /categories | Categories, Add Category | Same visual pattern, description, counts, archived toggle, actions, click tasks | Add category |
| /calendar | Month/year, prev/next, Today, New Task | Monday-start month grid, today/selected styling, group-colored task indicators (max 3 + count), selected day task list, active/completed filter | Empty selected day with add CTA |
| /completed | Completed | Search/group filters, completion date, details, reopen/delete actions; newest first | No completed tasks |
| /settings | Settings | Theme radio Light/Dark, language ID/EN, desktop sidebar toggle, version, read-only resolved DB location | Not applicable |

## Task modal
Title required, task type toggle (academic/nonacademic), group selector conditional, assigned date, due date, optional time, level segmented 0–5 plus label, status select, optional description/notes (collapsible), Cancel/Save. Group missing: inline CTA to create group then return with draft retained; inactive options disabled except current archived association. Editing type clears incompatible FK and requires new group. Display error near field and summary for server error. Disable double submit; preserve form on failure; close on successful save and toast. Detail modal read-only with Edit, complete/reopen, Delete. Course and category modal fields follow DATABASE. Confirm delete text names target and irreversible effect; archive action distinct. Default group seed is English user data, not translated.

## Components
AppShell, Sidebar, Topbar, MobileDrawer, PageHeader, TaskList/TaskRow/TaskCard, TaskFormDialog, TaskDetailDialog, GroupFormDialog, ConfirmDialog, DifficultyLabel, PriorityLabel, StatusSelect, FilterBar, MetricCard, ProgressBar, DistributionChart, CalendarGrid, DayTaskList, EmptyState, ErrorState, Skeleton, Toast, ThemeToggle, LanguageToggle. Charts with labels and accessible summary/table; no chart-only data. Use shadcn primitives and Lucide icons. No UI framework defaults overriding token system.

## States and interactions
Every fetch: loading skeleton, success, empty, recoverable error/retry. Mutations: pending, success only after server commit, localized validation error and network/storage error. Keyboard tab order follows layout; Escape closes topmost dialog; return focus to opener; tooltip for icon-only controls; status not color only. Search debounce ~200ms or immediate for local data; avoid stale results. Filter state may be URL query; resets on Clear; sort stable. All date display via Intl locale, time 24h; actual data unchanged on switch. All strings in id/en message dictionaries including aria/validation/toast/chart/calendar. HTML lang follows locale. No full reload on switch; preserve route and draft. Theme persisted in DB with local theme mirror only, no flash on startup. Default Light, ID. Verify all 8 pages both modes and languages at 320/768/1024/1440 widths.
