---
title: The life of a change
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_db_object/ade43a3b8c5503100a22deb6dd2b4ed2
    children: sys_choice
    how: read the change states and close codes
    result: New, Assess, Authorize, Scheduled, Implement, Review, Closed, Canceled
    hash: 7771030b7d0ed757de55f879efd9b81cd25ca246538f46d71ae53138709e748a
  E02:
    record: chg_model/62d10fa1c303101035ae3f52c1d3aec1
    how: read the Emergency model's states
    result: no Assess
    hash: a87686446521f737d59ae3dc8646e0573c75c806cd56fa7b766bb534bbeb174e
  E03:
    record: chg_model/e55d0bfec343101035ae3f52c1d3ae49
    how: read the Standard model's states
    result: no Assess or Authorize
    hash: 4bd9997ad1c4b87191df2684de07200297e45dd6590d10006686d7300dacd13c
  E04:
    record: sys_script/b6dae9e15317101034d1ddeeff7b1278
    field: script
    how: 'read Change Model: Check State Transition'
    result: refuses a state change the model doesn't allow
    hash: d3b37e4e63f6440f9f305b9946112dd1858f2771f5e3d31b091815d53d85347e
  E05:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'classic change form, CHG0000036 (Normal, New)'
    how: 'read the process flow'
    result: 'New › Assess › Authorize › Scheduled › Implement › Review › Closed › Canceled'
---
A change is planned, approved, carried out at its planned time, then checked and closed.

## The states {for=operator}

| State | What it means |
|---|---|
| **New** | being planned |
| **Assess** | the technical approvers are checking it |
| **Authorize** | waiting for the manager's or the change advisory board's (CAB) approval |
| **Scheduled** | approved; waiting for its window |
| **Implement** | being carried out |
| **Review** | done; the result is being checked |
| **Closed** | finished: successful, successful with issues, or unsuccessful |
| **Canceled** | not going ahead |

[E01] [E05] Not every kind uses every state: an emergency change skips *Assess*, and a standard
change skips *Assess* and *Authorize*. [E02] [E03]

## What you notice {for=user}

A change is approved before it is carried out: first by the team doing it, then by its manager
or the change advisory board (CAB). You're asked by email while it waits for you; your answer
moves it on, or sends it back. See [Approve a change](see:approve).

## What moves it on {for=operator}

| Kind | Path |
|---|---|
| Normal | New → **Request Approval** → Assess → (approved) → Authorize → (approved) → Scheduled → **Implement** → **Review** → **Close** |
| Emergency | New → **Request Approval** → Authorize → (CAB approves) → Scheduled → Implement → Review → Close |
| Standard | New → Scheduled → Implement → Review → Close |

The buttons move it where the model allows, and a state change the model doesn't allow is refused
on save. [E04] *On hold* is a checkbox with a reason, not a state.
