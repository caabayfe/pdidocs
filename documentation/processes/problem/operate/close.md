---
title: Accept the risk, cancel or reopen
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/39d088a487a313000e3dd61e36cb0bc3
    how: read Accept Risk
    result: from Root Cause Analysis or Fix in Progress; asks cause notes, a reason and any workaround
    hash: 108939f4eef5838b563ef26a23dce698675312dbf57b687e8cc9a8ff3867ea4d
  E02:
    record: sys_properties/e457cdb5874023000e3dd61e36cb0bde
    field: value
    how: read problem.acceptrisk.move_to_closed
    result: true; goes straight to Closed
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E03:
    record: sysevent_script_action/315aa414534123004247ddeeff7b1240
    field: script
    how: read Update Incident when Problem closes
    result: 'on Risk Accepted, waiting incidents only get the work note "Problem team has accepted the risk of not fixing this problem …" with your reason'
    hash: 05ad6dee5b208584f1f5ea888e7cb64d0efa10da0a9cb80903a7db107fb633dd
  E04:
    record: sys_ui_action/36b5b71487a313000e3dd61e36cb0bd3
    how: read Mark Duplicate
    result: from Assess or Root Cause Analysis; asks for the original problem
    hash: 781855b27d4cbfedf0ee906235c9780602cd6e61d729c1ac8c1a781e1c1f5ee8
  E05:
    record: sys_ui_action/e7ef379487a313000e3dd61e36cb0bde
    how: read Cancel
    result: from Assess or Root Cause Analysis; asks for the canceled reason
    hash: d93e8718db5ac3a5b70b180e6c1d39403d7b6db0ac4e90f11752e4d0a2eeaebe
  E06:
    record: sys_ui_action/2bd3fbd087a313000e3dd61e36cb0bce
    how: read Re-Analyze
    result: form button; sets Root Cause Analysis and saves; shown from Fix in Progress, Resolved, or Closed for the role in the reanalyze properties
    hash: 77d4cb329eadc42a4babeadaa763c6a003f4aedfdabb1c4ad0e7f1c029ea8698
  E07:
    record: sys_properties/e3a84539874023000e3dd61e36cb0b94
    field: value
    how: read problem.closed.role.reanalyze_from_completed
    result: problem_manager
    hash: 3c421abd171995b4281e188dfc5405b37e5dd9846040416b7510f70413a824e8
  E08:
    record: sys_security_acl/80acf238c0a801661d96d0359c65c928
    field: script
    how: read the problem write ACL
    result: a closed problem can't be edited
    hash: c0d28767b261d93896f99da63bec18f0f9f30d96c05149c137a9ff2700449c17
  E09:
    record: sys_ui_script/592479f30b4123005775aabcb4673a32
    field: script
    how: read ProblemModalUIHelpers (onAcceptingRisk, onMarkDuplicate, problem_Cancel)
    result: 'sets the state and resolution code; saves at once when the required fields are filled, otherwise opens the dialog Accept Risk, Mark Duplicate or Cancel; for a duplicate may show "Marking this problem as a duplicate will move related records to the Duplicate of problem as a background task"'
    hash: cfa7f1a91891d9e5e40859bed927383e378c3d615ad5cb26814fdfcc756de0f8
  E10:
    record: sys_ui_section/4c32dbe7873c23000e3dd61e36cb0b7a
    children: sys_ui_element
    how: read the Accept Risk dialog view
    result: state, resolution code, cause notes, close notes, workaround, workaround applied
    hash: 7488eb276fb06113a5fac3ebd08f624817a74a843864716c04d67af404640e49
  E11:
    record: sys_ui_section/69920fe787f823000e3dd61e36cb0be9
    children: sys_ui_element
    how: read the Mark Duplicate dialog view
    result: state, resolution code, duplicate of
    hash: dc9eb8e5462a6b802662dbc7a50beeccac868bba052d28b1dcb914c5fb04cb3b
  E12:
    record: sys_ui_section/b19a8f6f87f823000e3dd61e36cb0b6b
    children: sys_ui_element
    how: read the Cancel dialog view
    result: state, resolution code, close notes
    hash: cd8e1022db94a2aa4156346808fec10d1e4dd2a935d6a0e19c6733a046b705c1
  E13:
    record: sys_script_client/b5e93a71538823004247ddeeff7b12b0
    field: script
    how: read Rename Closed fields on load
    result: close notes read Risk accepted reason or Canceled reason; closed by reads Risk accepted by, Canceled by, Marked duplicate by or Completed by
    hash: db6f2838fd3e077546bb3d0f0de9fc0e5b4234c8399e5b1288c3be36844d1c12
  E14:
    record: sys_script/0f6e097087a313000e3dd61e36cb0b71
    field: script
    how: read Update fields on Re-analyzing a Problem
    result: from Resolved or Closed, stamps reopened at and by, adds one to the reopen count, and clears closed, resolved, close notes and resolution code
    hash: e462d1fbdcaaabe9cb6c416e7115184041cedb7980673f6cf88e112cc56171b4
  E15:
    record: sys_script_include/f8b66716871313000e3dd61e36cb0b77
    field: script
    how: read ProblemStateUtilsSNC canReAnalyze
    result: a closed problem can be re-analyzed only if it was completed, canceled or risk-accepted, by the role in the matching property; a duplicate never
    hash: 8d690cd0a55837e341f6658b47c51560e80fffe2583333d73bbed9fa4a23668e
---
All of these are buttons on the **classic problem form**.

## Accept the risk

{{animation:prbclose}}

Use it when fixing isn't worth it, from *Root Cause Analysis* or *Fix in Progress*. [E01]

1. Press **Accept Risk**. If the required fields are missing, the **Accept Risk** dialog opens.
   [E09]
2. Fill **Cause notes**, the **Risk accepted reason**, and the **Workaround** people should keep
   using, with **Workaround applied** if it is. [E10] [E13]
3. Confirm. The problem closes at once with the resolution code *Risk Accepted*. [E02]

Incidents waiting for it are **not** resolved: they get the work note *"Problem team has accepted
the risk of not fixing this problem …"* with your reason, and stay with their teams, who should
resolve them with the workaround. [E03]

## Mark it a duplicate

From *Assess* or *Root Cause Analysis*: [E04]

1. Press **Mark Duplicate**. The **Mark Duplicate** dialog opens. [E09]
2. In **Duplicate of**, choose the original problem. [E11] You may see *"Marking this problem as
   a duplicate will move related records to the Duplicate of problem as a background task"*.
   [E09]
3. Confirm. The problem closes with the resolution code *Duplicate*. [E09]

## Cancel it

From *Assess* or *Root Cause Analysis*, when it isn't a problem after all: [E05]

1. Press **Cancel**. The **Cancel** dialog opens. [E09]
2. Write the **Canceled reason**. [E12] [E13]
3. Confirm. The problem closes with the resolution code *Canceled*. [E09]

## Re-analyze it

1. Press **Re-Analyze**, from *Fix in Progress*, *Resolved* or *Closed*. [E06]
2. The problem goes back to **Root Cause Analysis**. From *Resolved* or *Closed*, its resolution
   code, close notes and closing dates are cleared and the reopen count goes up by one. [E14]

A closed problem can't be edited otherwise. [E08] Only a problem manager can re-analyze it [E07],
and a duplicate can't be re-analyzed. [E15]

## What happens next

Once closed, the problem is read-only until someone re-analyzes it. [E08] To keep working on the
cause, see [Assess and find the root cause](see:investigate).

## Tips

- Accepting the risk leaves the waiting incidents open: tell their teams so they resolve them.
  [E03]
- Write the reason for the incident teams too: with *Risk Accepted* they receive it word for
  word. [E03]
