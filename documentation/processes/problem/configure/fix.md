---
title: Fix and resolution - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sysevent_script_action/315aa414534123004247ddeeff7b1240
    field: script
    how: read Update Incident when Problem closes
    result: 'fix_applied: Resolved, close code Resolved by problem (San Diego plugin active), notes "Related problem {0} closed.", event incident.resolved_by_problem'
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
---
## Resolving waiting incidents

On *Fix Applied*, waiting incidents are resolved with *Resolved by problem* and the assignee is
emailed. [E01] [E02] The script runs on every state change while the code is set, in practice on
Resolve and Complete.

## Changes

Changes are created from the form menu with the problem as parent. [E05]

## Closing

Open tasks are canceled when the problem closes. [E03] The legacy rule *SNC - ITIL - Update
Related Incidents* is active but can never fire. [E04]
