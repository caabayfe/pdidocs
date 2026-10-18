---
title: Who is told what
reviewed: 2026-10-17
evidence:
  E01:
    record: sysevent_email_action/aea24ac2c611227101fe910c323fb00e
    how: read Approval Request
    result: '"<Change Request> <number> Approval Request" to each approver, with approve and reject links'
    hash: 6f535a07b72cecda86b48a1bcad2744f1ec80b97b682728563cd338bc646927b
  E02:
    record: sysevent_email_action/ae127113c611227101038b7890391e0a
    how: read Change approved
    result: to the assignee
    hash: 28772b5b95470ac9f41d9de8c817d35e5ad71830707dc63c4941106dffceb7ee
  E03:
    record: sysevent_email_action/ae14a7d9c611227100f0761a07f7be54
    how: read Change rejected
    result: to the assignee
    hash: 412a97d17de7db197919c0c12d6b95f097420fca1288c0d2b0cc9715dcebd31e
  E04:
    record: sysevent_email_action/9d417f7ac3122200b6dcdfdc64d3ae76
    how: read Change request state change notification
    result: '"<number> state changed to <state>" to the requester, on every change'
    hash: 04883cd5db538c749eb81cb6d9e07328ffaee1c9c0448976c7636d5237703ffc
  E05:
    record: sysevent_email_action/69f8ea5f4a36231201e47fb2a2ea0b62
    how: read Change assigned to me
    result: to the assignee
    hash: 76e6da0c50bbb42bc2d749e0f484659f7738d01576444024e8205eed070b7594
  E06:
    record: sysevent_email_action/32769cd8d7332200f2d224837e6103f0
    how: read Change request on hold notification
    result: to the requester
    hash: 8c08739dffb06e3871c268e3f725b1f7205dd2379c1bf42f193e4d2cb09d237c
  E07:
    record: sysevent_email_action/e8de45eeb7203300a5ee8ac7ee11a9a9
    how: read Unauthorized change created
    result: to the CI's owners and the assignee
    hash: 974414dcef6416a24b5cb4bcbe3324290f536dc2761699287f6f7e425a54e073
---
## Emails

| When | Who |
|---|---|
| An approval is requested | each approver, with **approve** and **reject** links [E01] |
| It is approved or rejected | the assignee [E02] [E03] |
| Its state changes | the requester, every time [E04] |
| It is assigned | the assignee [E05] |
| It is put on or taken off hold | the requester [E06] |

### What reaches you {for=user}

The approval request email; you can answer it by reply (see [Approve a change](see:approve)).

### Unauthorized changes {for=operator}

When a change nobody approved is detected on a configuration item (CI), the CI's owners and the
assignee are emailed. [E07]

### Expect many {for=operator}

The requester is emailed on **every** state change. [E04]
