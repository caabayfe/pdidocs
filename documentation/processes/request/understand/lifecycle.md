---
title: The life of a request
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_db_object/bc05b6bb8c5503100a22deb6dd2b4ea0
    children: sys_choice
    how: read the request's request state and stage choices
    result: Pending Approval, Approved, Closed Complete, Closed Incomplete, Closed Cancelled, Closed Rejected, Closed Skipped
    hash: bd344f3ec8f045eac0e5f041e741b75f5cd7693279a8122c7e4d7f850cd20bce
  E02:
    record: sys_hub_flow/30f3d26187e92300e0ef0cf888cb0b91
    how: read the stages of Service Catalog item request
    result: Manager Approval, Dept. Head Approval, CIO Approval, Order Fulfillment, Backordered, Deployment, Completed, Request Cancelled
    hash: 7e4c924ae8f9da3ea0457d090b77e53a58e495b1cc6bbb64ef9f043b7d32201b
  E03:
    record: sys_script/596fac6bc0a8010a00dca5b76857e592
    field: script
    how: read Close Parent if Required
    result: the request closes when all its items are closed
    hash: 1ea7f2d4c1812b85f56e342daf3d9e3ed591fd2725523fa77e94ed49d0160dd3
  E04:
    record: sys_script/19a9ecb40a0a0a65013c62ab86e8036e
    field: script
    how: read Set Request State
    result: approved → Approved; rejected → Closed Rejected
    hash: 5e7881782fe467f61290d5816d1fb33828e0f7a6c22394add429efebcef399cd
---
A request is ordered, approved if it needs to be, delivered, then closed. Each thing in it moves
on its own.

## What you see {for=user}

In **My Requests** each request shows its state, and each thing you ordered shows its stage. What
each state, stage and email means: [Your request's statuses and emails](see:statuses).

## The request {for=operator}

| State | What it means |
|---|---|
| **Pending Approval** | waiting for an approval |
| **Approved** | approved; being fulfilled |
| **Closed Complete** | delivered |
| **Closed Incomplete** | closed without completing |
| **Closed Cancelled** | canceled |
| **Closed Rejected** | an approver said no |

[E01] [E04] It closes by itself when all its items are closed. [E03]

## Each item's stage {for=operator}

Each requested item shows a **stage**, such as *Manager Approval*, *Dept. Head Approval*, *Order
Fulfillment*, *Backordered*, *Deployment* and *Completed*. [E02] The stages come from the item's
fulfilment, so they differ between items.

### What moves it {for=operator}

Approvals and catalog tasks move items through their stages; closing the last task lets the
fulfilment finish the item, and the request closes after its items. [E03]
