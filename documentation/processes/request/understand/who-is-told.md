---
title: Who is told what
reviewed: 2026-10-17
evidence:
  E01:
    record: sysevent_email_action/0b4ae8c0b462b410f87755e926c386c2
    how: read Request was opened
    result: '"Request … was created", to the requester and the requested-for'
    hash: 8f6ee67bc42176de4e606a13ee5cd36ece48c9c0dd2e96791d786a31ab33a0d7
  E02:
    record: sysevent_email_action/d0e27780b4b27050f87755e926c38683
    how: read Request approved
    result: '"Request … was approved"'
    hash: 324a106b895b58ea8006c0a2de9e60dabc4f1d187347a93d6da5759d1cae46d6
  E03:
    record: sysevent_email_action/2bf1538377223010f088a0e89e5a99fb
    how: read Request Rejected
    result: '"… was Rejected"'
    hash: 234796e84ec819b04c11f149e1242870ac2a43a318c572eaa852fc14481c1627
  E04:
    record: sysevent_email_action/704d4cc4c611227d00f60f20d0758ddf
    how: read Request Item Delivery
    result: '"Your requested … for … is being delivered"'
    hash: 72cb2b2b81c186508eda8d8136eb754fc604adb07ce099015fc425a6410122b5
  E05:
    record: sysevent_email_action/a3360ac0672630105f74e8a331b73019
    how: read Request completed
    result: '"Request … was completed"'
    hash: 2a3e5c60c70aafff32b277421b8fcabfdad929c3b7100e4ecb9bed4b757f4a16
  E06:
    record: sysevent_email_action/78243e8877323010f088a0e89e5a9969
    how: read Comment left on request
    result: '"Comment added to request …"'
    hash: 4a4ca76a2d746eb9a0828bdaca12a138fc437900466e7a9d265d7a7fde25e07f
  E07:
    record: sysevent_email_action/bb32008477623010f088a0e89e5a9945
    how: read Request approval assigned
    result: '"… needs your approval", to the approver'
    hash: 76c55041050ceb1b900ef27b755c8f8f52f8abc7754d533ae6131cffc3376013
  E08:
    record: sysevent_email_action/039c7466c0a80102004f66ab6aa3e757
    how: read Email assigned to (sc_task)
    result: '"Task … has been assigned to you"'
    hash: b18dc7f294008300b75f2f40c17d6251fbe73d31686cf63fe4c499a36261fb30
  E09:
    record: sysevent_email_action/03973320c0a801020075d86be149dcbb
    how: read Email assigned to group (sc_task)
    result: to the group when nobody is assigned
    hash: f823867473c46219c97ee1e5a76f7ed5ab49950a0c0aaea8cb49b8e49a94a5f2
---
## Emails

| When | The requester | Others |
|---|---|---|
| The request is created | *"Request … was created"* [E01] | |
| An approval is needed | | the approver: *"… needs your approval"* [E07] |
| It is approved or rejected | *"… was approved"* or *"… was Rejected"* [E02] [E03] | |
| Someone comments on an item | *"Comment added to request …"* [E06] | |
| An item is delivered | *"Your requested … is being delivered"* [E04] | |
| The request is complete | *"Request … was completed"* [E05] | |

### For you {for=user}

Reply to an item's email to add information to it.

### For the team {for=operator}

When a catalog task is assigned, the assignee gets *"Task … has been assigned to you"*, or the
group when nobody is assigned. [E08] [E09]

Comments on an item reach the requester; use work notes for the team.
