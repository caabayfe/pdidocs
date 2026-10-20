---
title: Closure - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_script/464252f7c34332001488b731c1d3aeed
    field: script
    how: read Check open change_tasks
    result: refuses to close with open tasks (not for the Unauthorized, Registration and Cloud models)
    hash: 96ab884cb2cbb6d08edf3b811a75aaabee7a5476a1e14386b4a388688505f23a
  E02:
    record: sys_script/16bd8e77c34332001488b731c1d3aeeb
    how: read Cancel change_tasks
    result: cancels tasks when the change is canceled
    hash: ac7601f74eb9812baa56958344bbf9fff997814d0c5cbd58878da278917fb1fd
  E03:
    record: sys_script/6e20e124c611228e00e44dd37ad1b842
    how: read mark_closed
    result: inactive when Closed or Canceled
    hash: 01cfed56fe6760ef0e3dde371406e17727a975b8de213d38716d74daa62ddb13
  E04:
    record: sys_ui_policy/e7dc75a3cb900200d71cb9c0c24c9ca3
    how: read the close fields policy
    result: close code and notes required when Closed
    hash: ef0206b5c1815980031c2f589f24aa84035cf105d7de1480ff1e461f86a1079c
  E05:
    record: sys_ui_action/ff915528675b32006e6eadab9485ef3a
    how: read Revert to New
    result: Normal in Assess or Emergency in Authorize
    hash: 3795a50ebd18ee763fc84f3e59bf006a8a76ec391de9ae3b409902e46dd5c234
  E06:
    record: sys_script/0396ee215373130034d1ddeeff7b1224
    field: script
    how: read Mandatory Closure Information (before insert and update, order 900)
    result: 'when enforce_data_requirements is true, the change has no model and the state is Closed: errors "Close code is mandatory when closing a Change Request" and "Close notes are mandatory when closing a Change Request", and refuses an invalid close code; only missing notes or an invalid code abort the save'
    hash: 29270b2517beb690f28b85c99afd6705272d03004692c285852ce5b5c0ac4d50
  E07:
    record: sys_script/fac8cff1534123000999ddeeff7b126f
    field: script
    how: read Validate Close Code (before insert and update, order 901)
    result: 'when enforce_data_requirements is true and the close code changes: refuses a code that isn''t a close_code choice, "Close code cannot be set to an invalid value: {0}"'
    hash: f8899d54b6a15f1a310ec100a7357b790bb75102e57199f8794cbf2d31ab82f2
  E08:
    record: sys_properties/c56c6ddab733130034d1da23ee11a95c
    field: value
    how: read com.snc.change_management.enforce_data_requirements
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
---
## Closing

Closing needs a code and notes [E04] and no open tasks [E01]; the change becomes inactive. [E03]
Canceling cancels its tasks [E02]; *Revert to New* sends it back from approval. [E05]

## Server-side checks

Both rules run because *com.snc.change_management.enforce_data_requirements* is `true`. [E08]

| Rule | When, order | Condition | Effect |
|---|---|---|---|
| **Mandatory Closure Information** | before insert and update, 900 | state is *Closed* and the change has **no model** | *"Close notes are mandatory when closing a Change Request"* aborts the save; a missing close code only shows *"Close code is mandatory…"* and doesn't abort; an invalid code aborts [E06] |
| **Validate Close Code** | before insert and update, 901 | the close code changes | refuses a code that isn't one of the close code choices: *"Close code cannot be set to an invalid value: …"* [E07] |

Changes with a model (all the usual ones) rely on the form policy and the model's state transitions
for the close fields; only legacy changes without a model hit the closure rule. [E06] [E04]
Whether such a change may close without a code is not decided yet. [Q05]
