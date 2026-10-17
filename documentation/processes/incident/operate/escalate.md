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
---
## When it's bigger than one incident: major incidents

A **major incident** is an outage or degradation that hits many people or a critical service. It
gets a dedicated manager, a response team and regular communication.

### Agents and resolvers: propose it

1. Open the incident and choose **Propose Major Incident** (in the form's menu). [E01]
2. Say why: who is affected, what doesn't work, since when.
3. The incident becomes a **major incident candidate**. Its team is emailed, and major incident
   managers see it in their list of candidates.

Use it when several people report the same outage, or when a critical service is down. Don't wait
to be sure: the major incident manager decides.

### Major incident managers: decide

From **Incident › Major Incidents › Candidates**, open the candidate and choose: [E02]

- **Promote to Major Incident** (or **Create Major Incident**, depending on how your instance is
  set up) to start the major incident response;
- **Reject Major Incident Candidate** when it's an ordinary incident.

Once accepted, use **View Workbench** to run the response: timeline, communications and the
post-incident report.

### Link the other reports

Link every other incident about the same outage to the major incident as a **child**: open it,
set **Parent incident** in *Related Records*. Children get the parent's updates and are resolved
with it.

## Create related work from an incident

From the incident's form menu:

| Action | Use it when |
|---|---|
| **Create Change Request** / **Create Emergency Change** | the fix needs a change to a system |
| **Create Request** | the caller needs something new, not a repair |
| **Create Child Incident** | part of the work must be tracked separately [E03] |
| **Copy Incident** | another caller has the same issue (if enabled) |

The new record is linked to the incident, so the caller's incident shows what it waits for.

## Tips

- One major incident per outage. Link, don't duplicate.
