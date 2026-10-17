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
    result: on risk accepted, waiting incidents only get a work note
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
    result: back to Root Cause Analysis; from Closed only for the role in the reanalyze properties
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
---
## Accept the risk

When fixing isn't worth it, press **Accept Risk**: give the cause, the reason, and any workaround
people should keep using. [E01] The problem closes at once. [E02] Incidents waiting for it are
**not** resolved: they get a work note and stay with their teams, who should resolve them with the
workaround. [E03]

## A duplicate, or not a problem

**Mark Duplicate** closes it and asks for the original problem; **Cancel** closes it with a reason.
Both work from *Assess* or *Root Cause Analysis*. [E04] [E05]

## Reopen

**Re-Analyze** sends it back to *Root Cause Analysis*. [E06] A closed problem can't be edited
[E08]; only a problem manager can re-analyze it. [E07]
