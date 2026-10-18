---
title: How change management works
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_db_object/ade43a3b8c5503100a22deb6dd2b4ed2
    children: sys_choice
    how: read the change types and states
    result: types Standard, Normal, Emergency, Model
    hash: 7771030b7d0ed757de55f879efd9b81cd25ca246538f46d71ae53138709e748a
  E02:
    record: chg_model/007c4001c343101035ae3f52c1d3aeb2
    how: read the change model Normal
    result: default model
    hash: 2ed69ed3e8376288d464a35fd5dcce3562112b8c944d100820a95f031bd67207
  E03:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Service Operations Workspace › List › Default lists'
    how: 'read the list categories'
    result: 'no Changes category; Approvals › My approvals is there'
---
## What a change is

A **change** is any addition, modification or removal that could affect a service people rely
on: a server patch, a network reconfiguration, a new release. Recording and approving it first
stops changes from breaking what works, and tells people when something is planned.

## Three kinds

| Kind | Use it for | Approval |
|---|---|---|
| **Standard** | routine work done the same way every time, from a template | pre-approved |
| **Normal** | everything else, planned in advance | the team doing it, then its manager or the change advisory board (CAB) |
| **Emergency** | something that must be done now to restore or protect a service | the CAB |

[E01] Most changes are **Normal**, the default. [E02]

### What it means for you {for=user}

You meet change management when you are asked to **approve** a change: as a member of the team
doing it, as that team's manager, or as a member of the CAB. See [Approve a change](see:approve)
and [Who approves](see:approvals).

### Where you start {for=operator}

Changes are worked on the **classic form**, from the **Change** menu; the Service Operations
Workspace has no change lists, only your approvals under **Approvals › My approvals**. [E03] Start
with [Raise a change](see:raise).
