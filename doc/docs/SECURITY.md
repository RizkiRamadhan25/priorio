# Security and privacy
## Threat model
Single-user no auth; assume trusted OS account, untrusted web pages and user-entered strings. Loopback boundary prevents LAN exposure but does not protect against malware/local processes, other OS users with file access, or OS compromise. No encryption at rest in V1. Never deploy publicly or use tunneling/reverse proxy without redesign/authentication.

| Threat | Required control |
|---|---|
| LAN/public access | Bind 127.0.0.1 for dev/start, explicit port 3000. No 0.0.0.0. |
| Cross-origin mutation / DNS rebinding | Validate Host against exact loopback host+configured port, Origin against same allowed origin for mutation; reject missing/invalid origin for browser actions; enforce framework default CSRF protections; no wildcard allowedOrigins or permissive CORS. Test normal same-origin and evil origin/Host. Test server uses explicit isolated port. |
| SQL injection | Prisma parameterized query APIs; no raw interpolated SQL; Zod validate on server; strict allowlist for sort/filter. |
| XSS | Render user content as escaped text; no dangerouslySetInnerHTML; sanitize/avoid markdown HTML; do not trust filenames or color strings. |
| Data exposure | DB outside public; no API for file download, no absolute path accepted from UI; only trusted local env config; avoid sensitive logs and error stack in UI. |
| Integrity | FK restrict, CHECK constraints, transactions, archive guards, server-side validations. |
| External data leakage | No tracking, no CDN/fonts/analytics, disable Next telemetry in scripts/env, no cloud API or external calls after install. |
| Dependency risk | Exact direct pins, npm lock, review advisories and actual runtime compatibility; don't blindly force audit fix. |

Environment: DATABASE_URL=file:./data/priorio.db, NEXT_TELEMETRY_DISABLED=1. .env ignored, example tracked. Bind/port constants or test-only CLI overrides; no additional secret env. Git ignore DB files and sidecars, backups, user test output. Restrict local file permissions to user where OS supports it. Ensure DB path resolution consistent CLI/runtime and not public; UI shows resolved path read-only.

## Manual backup/restore
1. Stop server and all DB clients; verify no writer. Checkpoint WAL safely if applicable using SQLite tool/API, then close. Do not copy live database independently from WAL.
2. Copy DB to separate backup folder outside repo/public; if WAL/SHM remain, copy consistent stopped set together (prefer checkpointed backup). Timestamp filename; keep multiple generations. Verify backup with integrity_check in isolated copy, count records. Never upload to external services automatically.
3. Restore: stop server; back up current DB separately; restore selected snapshot to configured DB path with matching sidecars (remove stale sidecars only after verified shutdown and backup); run integrity_check and migration deploy if needed, then start. Verify counts and preferences. Never use migrate reset on personal data. Document Windows steps in release README and test on temporary DB.

## Release checks
Loopback actual listener; cross-origin rejected; malicious input rendered inert; DB inaccessible through static URLs; no external network requests after install; git status has no personal data; backup/restore tested with temp fixture; dependency issues recorded. No security claims until evidence exists.
