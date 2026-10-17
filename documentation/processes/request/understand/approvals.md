---
title: Who approves
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_hub_flow/011c5d579fd11210db9f618dfa0a1ce1
    how: read the subflow Request Management Approval
    result: requests over 1000 need approval from a group; below, auto approved
    hash: 6a2bf9df5bcde4821796803bc625bda2c55f7525b2e10a234388f121d60262e4
  E02:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Groups list'
    how: 'looked up the group the subflow names'
    result: 'Catalog Request Approvers > $1000'
  E03:
    record: sys_hub_flow/d4a0864e87232300bdcf480688cb0bb1
    how: read Requested Item Manager Approval
    result: asks the requested-for person's manager
    hash: 768ecdceeff520a77ca8ee1a4636521fe7c5bad41a0bc8bff7e33bfee2a130dd
  E04:
    record: sys_hub_flow/d8a9420287632300bdcf480688cb0bef
    how: read Requested Item Dept Head Approval
    result: asks the department head
    hash: 7725f09a82b08ab534279fd3c2159d7893fd0e33d11f023ff21cddfa9ca796de
  E05:
    record: sys_hub_flow/8b7565139f151210db9f618dfa0a1c70
    how: read Service Catalog Request Price Approval
    result: some services use the price rule on the item; a demo flow that creates no tasks
    hash: 25365d4e87cfe0fd97f7a90bbc2ebc86c48d22cb2e87e7eaa74b241f438782ca
---
## Two levels

| What | When | Who approves |
|---|---|---|
| The whole request | its total is over 1000 | the group **Catalog Request Approvers > $1000** [E01] [E02] |
| Most hardware and access items | always | the manager of the person it's for, then their **department head** [E03] [E04] |

Below 1000 the request itself is approved automatically. [E01] Some service items use the price
rule on the item instead. [E05]

### If you are asked {for=user}

You're asked as a manager or department head: see [Approve a request](see:approve).

### Waiting on approval {for=operator}

An item in *Manager Approval* or *Dept. Head Approval* has no catalog task yet; nothing to fulfil
until it is approved.
