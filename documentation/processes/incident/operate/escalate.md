---
title: Escalate and link related work
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/13c7a3a9dbc403004d27b31be0b8f5db
    how: read Propose Major Incident
    result: agents can propose an active incident without a parent; a reason is asked for
    hash: d82e618b437518fc55604f920ecf5655cc551f7ab57ab1caf1bad8ddcbd8b752
  E02:
    record: sys_ui_action/629afe040b2003005775aabcb4673a34
    how: read Reject Major Incident Candidate
    result: only major incident managers decide on a candidate
    hash: 300f492e1ae5ee5a84c38bd9faddcb362d6a8649b332e6f1f91bd4b4c0d8ec76
  E03:
    record: sys_ui_action/117f90e367cb3200060071bfa2415a51
    how: read Create Child Incident
    result: available when child incidents are enabled on the instance
    hash: 4a07e14e2ccd4b8a49bbe930c908dd040f1e50112ab736e28390d5907a6c4286
  E04:
    record: sys_ux_form_action_layout_group/99308efac7213010d7e818b1c7c26091
    how: read the workspace header's Create menu
    result: Create outage, problem, request, incident task, change request, child incident, knowledge
    hash: c8eb5d30f7c219d180377df6f16303d1eb8ec6b7ab2e83dc42d10b43c4cf057d
  E05:
    record: sys_ui_action/d40103f13b10030050bec9bb34efc4d5
    how: read Promote to Major Incident
    result: form menu; major_incident_manager only; set up for workspaces
    hash: 14eec9407c051830a0511c05d1da1232c8329e97289303b17016aa70b4429086
  E06:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Service Operations Workspace, INC0010023, header'
    how: 'opened the drop-down next to Create incident task'
    result: 'Create outage, Create request, Create child incident; no Create problem or Create change request'
  E07:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Service Operations Workspace, INC0010023, header ⋯'
    how: 'opened the overflow menu'
    result: 'Compose Email, Copy Incident, Report Knowledge Gap, Copy URL, Delete, Create new communication; no Propose or Promote'
  E08:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'classic incident form, INC0010023, context menu'
    how: 'opened the form context menu'
    result: 'Copy Incident, Create Incident Task, Create Outage, Create Request, Create Child Incident, Promote to Major Incident, Propose Major Incident; no Create Problem or Create Change Request'
  E09:
    record: sys_properties/3f2f9db80b2003005775aabcb4673a52
    field: value
    how: 'read sn_major_inc_mgmt…major_incident_creation'
    result: 'promote'
    hash: 363256bd153813bc7b3e4e1cb8a7e65b4a9c269ed27b1823925bd408833d6883
  E10:
    record: sys_properties/8c2863d6531232000600e26b88dc3411
    field: value
    how: 'read com.snc.incident.copy.enable'
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E11:
    record: sys_properties/9eed5e77674f3200060071bfa2415ab8
    field: value
    how: 'read com.snc.incident.create.child.enable'
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
---
## When it's bigger than one incident: major incidents {label=CHANGED}

A **major incident** is one failure that hits many people or a critical service. It gets a
dedicated manager, a response team and regular communication; the full guide is
[Major incident management](see:major-incident).

- **Propose it** on the classic form's menu with **Propose Major Incident**; the workspace
  doesn't offer it. [E01] [E07] [E08] See [Propose a major incident](see:major-incident/propose).
- A major incident manager **promotes** it (on pdi2 the candidate itself becomes the major
  incident) or **rejects** it. [E02] [E05] [E09] See
  [Promote or reject a candidate](see:major-incident/decide).
- **Link** every other report of the same failure to it: they follow it and are resolved with it.
  See [Link the other reports](see:major-incident/link).

## Create related work from an incident {label=CORRECTED}

In the workspace, press **Create incident task**, or open the drop-down beside it for **Create
outage**, **Create request** and **Create child incident**. [E04] [E06] **Copy Incident** is in the
overflow menu (⋯). [E07] Copying and child incidents are switched on. [E10] [E11]

| Action | Use it when |
|---|---|
| **Create request** | the caller needs something new, not a repair |
| **Create child incident** / **Create incident task** | part of the work must be tracked separately [E03] |
| **Create outage** | a service is down and the outage should be recorded |
| **Copy Incident** | another caller has the same issue |

*Classic form:* the same actions are in the form's menu. [E08]

### Raising a problem or a change {label=CHANGED}

There is no **Create problem** or **Create change request** on either screen. [E06] [E08] Create
the problem from **Problem › Create New** and set it in the incident's **Related Records › Problem**
(see [Raise a problem](see:problem/raise) and [Link incidents to a problem](see:problem/link)).
For a change, use **Change › Create New** and set it in **Related Records › Change request** (see
[Raise a change](see:change/raise)).

## Tips

- One major incident per outage. Link, don't duplicate.
