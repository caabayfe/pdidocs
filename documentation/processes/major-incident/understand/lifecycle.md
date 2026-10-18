---
title: The life of a major incident
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_db_object/b0e4363b8c5503100a22deb6dd2b4e97
    children: sys_choice
    how: read the incident's Major incident state choices
    result: Proposed, Accepted, Rejected, Canceled; empty means not a major incident
    hash: 438604df7c0701185679ccf5f78a95effda35ae621060096b2ab78a53ec5cac2
  E02:
    record: sys_security_acl/925c1406b7122010eeafbc16de11a9b2
    how: read the write ACL on incident.major_incident_state
    result: role nobody; only actions change the field
    hash: b15bd471a733972f3cbc30da11cd15016ea7f86b0f0674711656c47cb098c701
  E03:
    record: sys_script_include/58ab10353b333200fe02c9bb34efc421
    field: script
    how: read MajorIncidentTriggerRulesSNC (canProposeMIC, canApproveMIC, canRejectMIC, canDemoteMI)
    result: propose with itil or sn_incident_write; promote, reject and demote with major_incident_manager; never on a child incident or an inactive one
    hash: d88ba8b95a56f4824f7514af503b25a188d0ae191a42a0a8f985f904d4a25536
  E04:
    record: sys_script/545340d6872203003582af1e36cb0b1b
    how: read Update Major Incident State on Cancel
    result: canceling the incident ends its major incident state
    hash: a47ff4c95887141eb3a625bec722aae512b71455942c41f663816800c8da2578
  E05:
    record: sys_script_include/a1b5e796531232000600e26b88dc3472
    field: script
    how: read IncidentUtilsSNC canReopenIncident
    result: a major incident can't be reopened
    hash: ffcaf34fa9847d8197f844f13f50d9cecdb73af98017c5d0871ec60750488aa8
---
## The states

A major incident is still an incident, with the usual states (New, In Progress, Resolved…).

### The field {for=operator}

On top of the usual states it has a second status: candidate, major incident, rejected or
demoted. The status is the field **Major incident state**. [E01]

| Value | What it means |
|---|---|
| (empty) | an ordinary incident |
| **Proposed** | a candidate, waiting for a major incident manager |
| **Accepted** | a major incident; the response is under way |
| **Rejected** | the candidate was an ordinary incident after all |
| **Canceled** | demoted: it was a major incident and no longer is |

### What you notice {for=user}

Nothing changes on your own incident's page. When your report is part of the response, its
status moves with the response's, and it is resolved when the failure is fixed. See [Follow an outage](see:follow).

### Who moves it on {for=operator}

Nobody types the major incident state; actions set it. [E02] [E03]

| From | To | Action | Who |
|---|---|---|---|
| empty, Rejected or Canceled | Proposed | **Propose Major Incident** | service desk (itil) |
| Proposed (or empty) | Accepted | **Promote to Major Incident** | major incident manager |
| Proposed | Rejected | **Reject Major Incident Candidate** | major incident manager |
| Accepted | Canceled | **Demote Major Incident** | major incident manager |
| Proposed or Accepted | Canceled | cancel the incident itself [E04] | |

A child incident can't be proposed, and a resolved or closed incident can't change. A major
incident can't be **reopened**. [E05]
