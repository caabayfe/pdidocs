# pdi2 documentation

User guide and technical reference of the **incident management** process on pdi2, written
with snagentic's documentation capability (ADR-0034, spec 010) from the pdi2 mirror on
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

| | |
|---|---|
| Process | Incident management: 5 roles, 6 states, 9 capabilities |
| Pages | Overview plus a user guide and a technical page per capability (20 pages) |
| Evidence | 140 items, each anchored to a mirror record; all fresh on 2026-10-17 |
| Animations | Reporting, lifecycle, priority, assignment; narrated with Piper |

## Open questions for the process owner

The mirror redacts property values and doesn't hold users, groups or scheduled jobs, so these
are marked OPEN-QUESTION on the technical pages:

1. **Auto close**: after how many days (`glide.ui.autoclose.time`), and on what schedule?
2. **Major incidents**: does the manager see *Promote* or *Create Major Incident*, and which team
   receives major incidents?
3. **Child incidents and Copy Incident**: are they enabled?
4. **Routing**: all assignment rules are inactive and the assignment lookup has one demo row.
   Is routing meant to rely only on the CI's support group?
5. **Raising a problem**: there is no *Create Problem* action on incident. How do resolvers do it?
6. **Closing**: resolvers can't close another caller's incident (only the caller or a team lead).
   Is that how the service desk works?
7. **Labels**: does the form say *Resolution code / notes* (used in the guide) or *Close code /
   notes* (dictionary labels)?
8. **Employee Center**: the exact *Get help* and *My Requests* labels on the portal.
9. **Possible defect**: *VIP scratchpad* reads the assignee's VIP flag, not the caller's.
10. **Survey**: the active survey condition is called *ITSM Demo Survey*. Keep it?
