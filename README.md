# pdi2 documentation

User guide and technical reference of the **incident management** process on pdi2, written
with snagentic's documentation capability (ADR-0035, spec 010) from the pdi2 mirror on
2026-10-17. `instances/pdi2` is a link to `../pdi2/instances/pdi2` and is only read.

## Look at it

The built site and the videos are already here:

- site: `.snagentic/site/index.html` (any web server, for example
  `cd .snagentic/site && python3 -m http.server 8766`, then http://127.0.0.1:8766/);
- videos: `.snagentic/videos/inclife.mp4` (lifecycle, 50 s) and `incprio.mp4` (priority, 36 s).

Rebuild with the snagentic source on branch `feat/docs-site`:

```bash
cd ../../snagentic20-docs
bun packages/cli/src/main.ts --workspace ../spaces/pdi2-docs docs check
bun packages/cli/src/main.ts --workspace ../spaces/pdi2-docs docs build --voice piper
bun packages/cli/src/main.ts --workspace ../spaces/pdi2-docs docs serve
bun packages/cli/src/main.ts --workspace ../spaces/pdi2-docs docs video inclife --voice piper
```

## What is in it

The documentation has a section per reader (spec 010a): end users, operators and the platform
team, with shared pages each reader sees in their own version.

| | |
|---|---|
| Process | Incident management: 1 end-user role and 4 operator roles, 6 states, 10 capabilities |
| Understand (shared) | overview, lifecycle, priority and deadlines, who is told what, glossary |
| Use (Employee Center, email, phone) | report, follow, confirm the fix or reopen |
| Operate (Service Operations Workspace, classic form) | log, prioritise, assign, work, resolve, close/reopen/cancel, escalate |
| Configure | a page per operator capability, the overview, and the configuration index (`configure/records.html`) |
| Evidence | 215 items, each anchored to a mirror record; all fresh on 2026-10-17 |
| Animations | Reporting, lifecycle, priority, assignment; narrated with Piper |

## Open questions for the process owner

Marked OPEN-QUESTION on the pages. The mirror doesn't hold property values, users, groups,
scheduled jobs or on-screen label translations (`sys_documentation`):

1. **Auto close**: after how many days (`glide.ui.autoclose.time`)?
2. **Get support**: what does Employee Center's *Get support* window offer? Its cards aren't
   mirrored.
3. **Major incidents**: *Promote* or *Create Major Incident*? Which team receives them? Where do
   *Propose* and *Promote* appear in the workspace?
4. **Create problem / Create change request** in the workspace: the actions behind them aren't
   mirrored; confirm they work.
5. **Child incidents and Copy Incident**: are they enabled?
6. **Routing**: all assignment rules are inactive. Is routing meant to rely only on the CI's
   support group?
7. **Closing**: resolvers can't close another caller's incident (only the caller or a team lead).
8. **Labels**: the dictionary says *Close code / Close notes*; the instance's own policies say
   *Resolution code / notes* (used in the guides). Confirm on screen.
9. **Virtual Agent**: no incident topics are installed; the *Create Incident using VA* form
   exists but nothing uses it. Is Virtual Agent meant to be an incident channel?
10. **Possible defect**: *VIP scratchpad* reads the assignee's VIP flag, not the caller's.
11. **Survey**: every closed incident sends *ITSM Demo Survey*. Keep it?
12. **Not documented yet**: the configuration index lists 300+ active records on the incident
    tables that no page cites; review them for anything people notice.
