---
title: The life of a problem
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_db_object/64e4b23b8c5503100a22deb6dd2b4ea5
    children: sys_choice
    how: read the problem state and resolution code choices
    result: New, Assess, Root Cause Analysis, Fix in Progress, Resolved, Closed; Fix Applied, Risk Accepted, Canceled, Duplicate
    hash: a4a2221c0bf514d2bfc1aeefcafb6a77b75b45967239a12b2935788d0216a43b
  E02:
    record: sttrm_state_transition/784efebfb70c021041c2feb0be11a966
    how: read New to Assess (model General)
    result: needs an assignee
    hash: 799e221e1b15eadf4e1c44bd43a595ce75d7516611184528f4dcf32046849197
  E03:
    record: sttrm_state_transition/2ecebaffb70c021041c2feb0be11a9f4
    how: read Root Cause Analysis to Fix in Progress
    result: needs cause notes and fix notes
    hash: 3bd55e5528f3ecb7deafbd047e679b753bc47b8aeb76bfa2ae13f043d562dbb1
  E04:
    record: sttrm_state_transition/5f044b8cb7010210987ebea0be11a9e5
    how: read Root Cause Analysis to Resolved
    result: needs cause notes and close notes
    hash: 0e4bc5cbac14a3efbdcc47791d1d16f5b1a36b509e4376983e78652bc919e0c3
  E05:
    record: sys_properties/e457cdb5874023000e3dd61e36cb0bde
    field: value
    how: read problem.acceptrisk.move_to_closed
    result: true; accepting the risk closes the problem
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E06:
    record: sys_properties/e3a84539874023000e3dd61e36cb0b94
    field: value
    how: read problem.closed.role.reanalyze_from_completed
    result: problem_manager
    hash: 3c421abd171995b4281e188dfc5405b37e5dd9846040416b7510f70413a824e8
---
## The states

A problem moves from being raised, through finding and fixing its cause, to being closed.

### Each state {for=operator}

| State | What it means |
|---|---|
| **New** | raised; nobody has looked at it yet |
| **Assess** | a coordinator checks it is a real problem |
| **Root Cause Analysis** | confirmed; the cause is being found |
| **Fix in Progress** | the cause is known; the fix is under way |
| **Resolved** | the fix is in; waiting to confirm it worked |
| **Closed** | finished: completed, canceled, a duplicate, or the risk accepted |

[E01]

### What you notice {for=user}

Nothing directly: problems are internal to IT. Your incident shows *On Hold* while it waits, and
is resolved when the fix is in. See [When a problem is behind your incident](see:affected).

### What moves it on {for=operator}

| From | To | Button | Needs |
|---|---|---|---|
| New | Assess | **Assess** | an assignee [E02] |
| Assess | Root Cause Analysis | **Confirm** | |
| Root Cause Analysis | Fix in Progress | **Fix** | cause notes and fix notes [E03] |
| Root Cause Analysis or Fix in Progress | Resolved | **Resolve** | cause notes (and close notes from RCA) [E04] |
| Resolved | Closed | **Complete** | |
| Assess or RCA | Closed | **Mark Duplicate**, **Cancel** | the duplicate's original, or a reason |
| RCA or Fix in Progress | Closed | **Accept Risk** | cause notes and a reason [E05] |
| Fix in Progress, Resolved or Closed | Root Cause Analysis | **Re-Analyze** | from Closed only a problem manager [E06] |

When it closes, its resolution code says how: *Fix Applied*, *Risk Accepted*, *Canceled* or
*Duplicate*. [E01]
