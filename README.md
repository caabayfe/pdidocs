# pdi2 documentation

User guide and technical reference of the **incident management** process on pdi2, written
with snagentic's documentation capability (ADR-0036, spec 010) from the pdi2 mirror on
2026-10-17. `instances/pdi2` is this workspace's own mirror of pdi2 (see *The mirror* below).

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

## Answered on 2026-10-17

From the mirror's property values (kept since snagentic 2.1) and checks on screen (signed in as
admin, recorded as `seen` evidence on the pages):

- **Auto close**: 7 days (`glide.ui.autoclose.time`).
- **Get support** in Employee Center: *Request password reset*, and *Contact us* with the service
  desk's phone, +1-200-120-2020, 9am to 5pm PST.
- **Reporting**: *Create Incident* is found with the portal search; the *Technology services*
  topic page doesn't list it.
- **Chat**: Employee Center's chat (*Now Support*) offers one topic, *Live Agent Support*.
- **Major incidents**: creation mode *promote*; *Propose* and *Promote* are on the classic form's
  menu only, not in the workspace.
- **Copy Incident and child incidents**: both enabled.
- **Create problem / Create change request**: offered on neither screen.
- **Labels**: the form shows *Resolution code / Resolution notes*, and *Channel* for the contact
  type.

## Open questions for the process owner

Marked OPEN-QUESTION on the pages:

1. **Major incident team**: which group receives major incidents (the property names a group,
   which the mirror doesn't hold)?
2. **Raising a problem or a change** from an incident isn't offered on either screen. Intended?
3. **Routing**: all assignment rules are inactive. Is routing meant to rely only on the CI's
   support group?
4. **Closing**: resolvers can't close another caller's incident (only the caller or a team lead).
5. **Possible defect**: *VIP scratchpad* reads the assignee's VIP flag, not the caller's.
6. **Survey**: every closed incident sends *ITSM Demo Survey*. Keep it?
7. **Auto close schedule**: the job that runs the auto close rule isn't mirrored; how often does
   it run?
8. **Not documented yet**: the configuration index lists the active records on the incident tables
   that no page cites; review them for anything people notice.

## Major incident management (2026-10-17)

`processes/major-incident/`: 3 shared pages, 1 end-user page (following an outage), 6 operator
pages (propose, decide, link, run, communicate, review) and 6 configure pages. Linked from
incident's *Escalate* page.

Answered on screen: no trigger rules exist (candidates are proposed by hand only); no
communication plan definitions exist for incidents (every communication is started by hand); the
major incident group property is **empty**, so promotion reassigns nobody; the *System status*
quick link opens `?id=services_status`.

Open questions:

1. **Major incident team**: set `sn_major_inc_mgmt.major_incident_management_group` if promotion
   should hand the incident to a team.
2. **Comment copies to child incidents** run through a flow action marked inactive. Test: create
   two incidents, link one as the other's child, add a comment on the parent, and check the
   child's activity and the caller's email.
3. **The workbench**: pdi2 has no major incident yet, so the workbench hasn't been seen.
4. **System status for employees**: its outage data is readable only with a support role; open it
   as a plain employee during an outage.
5. **Reject without the role**: the list reject and the workbench REST reject check only itil or
   workbench access on the server; only the UI requires a major incident manager.

## Problem management (2026-10-17)

`processes/problem/`: 3 shared pages, 1 end-user page, 6 operator pages (raise, link,
investigate, workaround, fix, close) and 6 configure pages. Incident's *Escalate* page links to it.

Answered on screen: the Service Operations Workspace has no problem (or change) lists, so problems
are worked on the classic form; the short description is labelled *Problem statement*; the form's
related lists are Affected CIs, Problem Tasks, Change Requests, Outages and Attached Knowledge;
the form menu creates outages, normal, standard and emergency changes, and known error articles.

Open questions:

1. **No Incidents list on the problem form**, although the configuration lists it first; its *Add*
   button depends on `com.snc.incident.link_to_task.problem`, whose value the mirror doesn't hold.
   Without it, coordinators can't see a problem's incidents.
2. **Only one way to raise a problem** (Problem › Create New): interactions, the major incident
   flow and the workspace's incident action are all off. Intended?
3. **Known errors for employees**: which knowledge base receives known error articles, and can
   employees read it?
4. **Duplicates**: which records move to the original (property value not mirrored).
5. **Legacy rules that can't fire**: *SNC - ITIL - Update Related Incidents* and *Problem Create
   Knowledge* are active but test a state value that no longer exists.

## The mirror

Since 2026-10-17 this workspace has its own pdi2 mirror (`servicenow-remote/pdi2`, integrated
into `main`), pulled with snagentic 2.1. Refresh it with `snagentic pull pdi2`, then
`snagentic integrate pdi2`, then `snagentic docs check`.
