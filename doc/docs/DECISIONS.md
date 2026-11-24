# Decisions & assumptions
## User-confirmed
Priorio; localhost storage; collapsible sidebar; task modal; monthly calendar V1; deadline-dominant score with level; ID/EN; light/dark; keep V1 simple.
## Defaults from PRD and implementation refinements (not individually approved)
- Single-user without login; loopback only. SQLite, Next.js and supporting stack selected as implementation baseline.
- Local date/time follows host OS timezone; production browser is on same host. Test Asia/Jakarta plus DST timezone; no timezone selector. Host timezone change reinterprets wall-clock deadline, by design.
- Calendar week starts Monday, includes completed by default; upcoming = today through today+6, active and not overdue; dashboard counts all persisted tasks including archived groups.
- Task default level 0, To Do, Academic, assigned today. Deadline time null means end of day (23:59:59.999). At exact explicit deadline instant not overdue; after instant overdue. Explicit HH:mm means HH:mm:00. DST nonexistent times resolve forward by gap; repeated times choose earlier instant (Temporal compatible semantics or equivalent).
- Reopen from Completed supports To Do/In Progress; preserve completion timestamp on editing completed task, clear on reopen. No audit history or soft-delete task.
- Group names unique within their table using Unicode NFKC, trim, collapse whitespace, lowercase; displayed name trimmed. Archive may retain active tasks; existing references may remain on edit, no new assignment to archived groups. Deletion restricted if any linked tasks exist. No cascading delete.
- Default groups seeded once via singleton seed flag (names Personal, Organization, Project, Others); edited/deleted defaults do not return. No sample tasks in production. Seed flag internal, not visible in UI.
- Search uses normalized case-insensitive substring title or description, combines filters with AND across fields and OR within a multi-select field; archived group filter available. All Tasks includes completed; active priority sort places completed last. Priority page rank fixed; completed page default latest completion.
- Settings DB authoritative, browser theme cache only for no flash; fixed light/ID defaults. Desktop sidebar preference persistent, mobile drawer ephemeral.
- Performance targets provisional until hardware baseline. Dependency exact pins to be resolved by environment gate, not falsely pre-verified. No public deployment or trademark validation.
- DESIGN uses indigo-neutral visual direction as proposal; no external design reference required. Scope does not include export/import, attachments, notification, Kanban, subtasks, AI, login, recurring tasks or cloud.
