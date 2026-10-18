---
title: Fulfilment - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_hub_flow/30f3d26187e92300e0ef0cf888cb0b91
    how: read Service Catalog item request
    result: used by 36 active items; manager and department head approval subflows; Procurement and Field Services tasks
    hash: 7e4c924ae8f9da3ea0457d090b77e53a58e495b1cc6bbb64ef9f043b7d32201b
  E02:
    record: sys_hub_flow/1e1799df9f911210db9f618dfa0a1c70
    how: read Service Catalog Request
    result: on every new request; approval when the price is over $1,000
    hash: f42c3095a91862f726125149a8b7a3f51591df6e201e102685d5c739a2af5b67
  E03:
    record: sys_properties/ab598cf30a2581024c8e144473f204c8
    field: value
    how: read glide.approval_engine.sc_request
    result: 'off'
    hash: b4dc66dde806261bdda8607d8707aa727d308cd80272381a5583f63899918467
  E04:
    record: sys_script/596fac6bc0a8010a00dca5b76857e592
    field: script
    how: read Close Parent if Required
    result: closes the request when all items are closed
    hash: 1ea7f2d4c1812b85f56e342daf3d9e3ed591fd2725523fa77e94ed49d0160dd3
  E05:
    record: sc_cat_item_delivery_plan/980f2c70c611227800d9a7a6da3e5328
    how: read IT Service - General
    result: inactive, still set on active items
    hash: f3e821b09d8ff64ef70aee967131f08abf7a9b564c5d999ae02b118e9814472a
  E06:
    record: sys_hub_flow/8b7565139f151210db9f618dfa0a1c70
    how: read Service Catalog Request Price Approval
    result: '"This flow is a demo fulfilment flow."; creates no tasks'
    hash: 25365d4e87cfe0fd97f7a90bbc2ebc86c48d22cb2e87e7eaa74b241f438782ca
  E07:
    record: sys_script/da911513c0a8010a00f6dcc71ea864bd
    field: script
    how: read Reject Parent (sc_task, after insert and update, order 100)
    result: when a catalog task from an execution plan approval (sc_cat_item_dt_approval) is rejected and that approval is set to cancel on reject, sets the item's stage Request Cancelled and its approval rejected
    hash: 2c29e1f2b9fd44885af1fd5c3acf7d5682792ef0cb5af6aecde29a61b654b231
---
## Engines

The request flow handles the approval over $1,000 [E02] (the legacy approval engine is off [E03]);
most items use *Service Catalog item request* [E01]. The request closes after its items. [E04]

## Rejected task approvals

**Reject Parent** (on catalog tasks, after insert and update, order 100) only covers tasks from
legacy execution plan approvals: when such a task is rejected and its approval step is set to
cancel on reject, the item gets the stage *Request Cancelled* and is rejected. [E07] Flow-based
items don't use it.

## Gaps {label=OPEN-QUESTION}

- Items still point to inactive execution plans such as *IT Service - General*. [E05]
- Eight service items use a flow described as a demo that creates no tasks. [E06]
- Some items name legacy workflows the mirror doesn't hold, and nine have no fulfilment at all.

Check what happens when each of these is ordered.
