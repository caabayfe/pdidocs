---
title: Fix and resolution - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sysevent_script_action/315aa414534123004247ddeeff7b1240
    field: script
    how: read Update Incident when Problem closes
    result: 'event problem.state_change, condition resolution code fix_applied or risk_accepted, incidents with problem_id = the problem, On Hold, hold reason Awaiting Problem; fix_applied: fix notes as work note, Resolved, close code Resolved by problem (San Diego plugin active), notes "Related problem {0} closed.", event incident.resolved_by_problem; risk_accepted: work note "Problem team has accepted the risk of not fixing this problem {0}" and the close notes'
    hash: 05ad6dee5b208584f1f5ea888e7cb64d0efa10da0a9cb80903a7db107fb633dd
  E02:
    record: sysevent_email_action/1884091c534123004247ddeeff7b1226
    how: read Incident resolved by Problem (ITIL)
    result: to the incident's assignee
    hash: 11658b5b65ea6295f5d6645f4589ea46915be473d785522872f3e67997d4fc43
  E03:
    record: sys_script/ba159c35870023000e3dd61e36cb0b66
    field: script
    how: read Cascade closure of Problem Tasks
    result: cancels open tasks when the problem closes
    hash: 053b27559971ea29e01545f3509978a6c0413769982fe81624f48f3990613b49
  E04:
    record: sys_script/69bf697c4a36231200dd54d9845de876
    field: script
    how: read SNC - ITIL - Update Related Incidents (legacy)
    result: active, but tests problem_state 4, which no longer exists
    hash: d32bb53108b8a34319f61dee0c789eab441677db555c81dfb73263d1dc596db7
  E05:
    record: sys_ui_action/2f596102c0a8006400a40575087b60b2
    how: read Create Normal Change
    result: itil and sn_change_write, no change linked yet
    hash: c95b84da8508b3c104b116fe95194564288e3a00c0a457fccd5b877941c8e1b6
  E06:
    record: sys_script/50e7a4be874823000e3dd61e36cb0b21
    field: script
    how: read Raise an event when state changes (problem, after update, order 100, state changes)
    result: queues problem.state_change with the new and previous state
    hash: 83db92f6e134987dfc239f33329bc06891253958466fedfb79e24a018ee248e6
  E07:
    record: sys_script/d92011b087a313000e3dd61e36cb0b01
    field: script
    how: read Update fields when Problem is Resolved (before update, order 120, state=106 and resolved_at empty)
    result: stamps resolved_at and resolved_by; for Risk Accepted also closed_at and closed_by
    hash: eec9a697ce10ead310bd214c1e65d71c0116c615bf2a4ad5e9412465f70c98fe
  E08:
    record: sys_script/ba91d5b087a313000e3dd61e36cb0b17
    field: script
    how: read Update fields on Problem Closure (before update, order 120, state=107 and closed_at empty)
    result: stamps closed_at and closed_by, and computes business and calendar durations from opened_at
    hash: f0430f13f6de2dd2dd40278cdd321c41b0f7210582625cea197d401ce6b535cf
  E09:
    record: sysevent_email_action/1e8daa5f9f2202008f97b89a442e70a4
    how: read Problem Closed
    result: 'engine, on update when active changes to false; to opened_by; "Your problem … has been closed"'
    hash: f6879a0478f7750f11e6a89c4335c1c82b838d1b17f041b8a5f7f5d6c5841894
  E10:
    record: sysevent_email_action/5b429dee7f0232005f58108c3ffa9188
    how: read Problem Closed inform Opener
    result: 'triggered type (sent only by a flow), to opened_by; "… you opened has been closed"; no record read sends it'
    hash: bd7fe36851d9d4483088a81b7f0aa4b2f50cc0ea9c9140f70676cacc4775db05
  E11:
    record: sysevent_script_action/eda3a490534123004247ddeeff7b123d
    field: script
    how: read Copy Prb fix to Inc work notes (on communicate.fix)
    result: 'work note "Proposed/Planned fix shared from PRB…" on linked incidents up to Resolved'
    hash: 62a7d0b6bde1f891b9335a318b12476f3e3059028cb737fa15b128ab4413b730
---
## Order of execution on problem (update)

| When | Order | Rule | Condition | Effect |
|---|---|---|---|---|
| before | 120 | Update fields when Problem is Resolved [E07] | state Resolved, resolved at empty | resolved at and by; with Risk Accepted also closed at and by |
| before | 120 | Update fields on Problem Closure [E08] | state Closed, closed at empty | closed at and by, durations |
| after | 100 | Raise an event when state changes [E06] | state changes | queues `problem.state_change` |

## Resolving waiting incidents

The script action *Update Incident when Problem closes* listens to `problem.state_change` and runs
while the resolution code is *Fix Applied* or *Risk Accepted*. [E01] [E06] So it acts at
**Resolve** (the state changes with *Fix Applied* set) and again at **Complete**, when no waiting
incident is left. It touches only incidents **On Hold - Awaiting Problem** linked to the problem:

| Resolution code | Effect on those incidents |
|---|---|
| *Fix Applied* | work note with the fix notes; Resolved, close code *Resolved by problem*, notes *"Related problem … closed."*; assignee emailed [E01] [E02] |
| *Risk Accepted* | work note *"Problem team has accepted the risk of not fixing this problem …"* only [E01] |

**Communicate Fix** sends the fix notes earlier, as a work note on linked incidents up to Resolved.
[E11]

## Changes

Changes are created from the form menu with the problem as parent. [E05]

## Closing

Open tasks are canceled when the problem closes. [E03] Whoever opened the problem gets *Problem
Closed*. [E09] *Problem Closed inform Opener* is a triggered notification that no record read
sends [E10]: it duplicates *Problem Closed* if a flow ever does. The legacy rule *SNC - ITIL -
Update Related Incidents* is active but can never fire. [E04]
