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
---
## Closing

Closing needs a code and notes [E04] and no open tasks [E01]; the change becomes inactive. [E03]
Canceling cancels its tasks [E02]; *Revert to New* sends it back from approval. [E05]
